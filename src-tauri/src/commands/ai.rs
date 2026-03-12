use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::process::Stdio;
use std::sync::{Arc, Mutex, OnceLock};
use tauri::Emitter;
use tokio::io::{AsyncBufReadExt, AsyncWriteExt, BufReader};
use tokio::process::Command;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AiSession {
    pub id: String,
    pub status: SessionStatus,
    pub ticket_id: Option<String>,
    pub task_description: String,
    pub started_at: String,
    pub model: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum SessionStatus {
    Running,
    WaitingForInput,
    Completed,
    Failed,
    Stopped,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SessionOutputLine {
    pub timestamp: String,
    pub stream: String, // "stdout", "stderr", "user_input"
    pub content: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SessionOutputEvent {
    pub session_id: String,
    pub line: SessionOutputLine,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SessionStatusEvent {
    pub session_id: String,
    pub status: SessionStatus,
}

// ---------------------------------------------------------------------------
// Session handle — holds process stdin and output history
// ---------------------------------------------------------------------------

struct SessionHandle {
    info: AiSession,
    stdin: Option<Arc<tokio::sync::Mutex<tokio::process::ChildStdin>>>,
    output_lines: Vec<SessionOutputLine>,
    abort_handle: Option<tokio::task::AbortHandle>,
}

// ---------------------------------------------------------------------------
// Global session store
// ---------------------------------------------------------------------------

fn sessions() -> &'static Mutex<HashMap<String, SessionHandle>> {
    static STORE: OnceLock<Mutex<HashMap<String, SessionHandle>>> = OnceLock::new();
    STORE.get_or_init(|| Mutex::new(HashMap::new()))
}

// ---------------------------------------------------------------------------
// Commands
// ---------------------------------------------------------------------------

#[tauri::command]
pub async fn spawn_claude_session(
    app: tauri::AppHandle,
    task_description: String,
    repo_path: Option<String>,
    ticket_id: Option<String>,
    model: Option<String>,
) -> Result<AiSession, String> {
    let session_id = uuid_v4();
    let now = chrono_now();

    // Build initial prompt
    let mut prompt = task_description.clone();
    if let Some(ref tid) = ticket_id {
        prompt = format!("[{}] {}", tid, prompt);
    }

    // Spawn claude in bidirectional stream-json mode
    let mut cmd = Command::new("claude");
    cmd.arg("--print");
    cmd.arg("--output-format").arg("stream-json");
    cmd.arg("--input-format").arg("stream-json");
    cmd.arg("--verbose");

    if let Some(ref m) = model {
        cmd.arg("--model").arg(m);
    }

    if let Some(ref path) = repo_path {
        cmd.current_dir(path);
    }

    // Remove CLAUDECODE env var to avoid nested session detection
    cmd.env_remove("CLAUDE_CODE_ENTRYPOINT");
    cmd.env_remove("CLAUDECODE");

    cmd.stdin(Stdio::piped());
    cmd.stdout(Stdio::piped());
    cmd.stderr(Stdio::piped());

    let mut child = cmd
        .spawn()
        .map_err(|e| format!("spawn_claude_session: failed to spawn claude process: {}", e))?;

    // Take ownership of stdin, stdout, stderr
    let stdin = child.stdin.take().ok_or("spawn_claude_session: failed to capture stdin")?;
    let stdout = child.stdout.take().ok_or("spawn_claude_session: failed to capture stdout")?;
    let stderr = child.stderr.take().ok_or("spawn_claude_session: failed to capture stderr")?;

    let stdin = Arc::new(tokio::sync::Mutex::new(stdin));

    let session = AiSession {
        id: session_id.clone(),
        status: SessionStatus::Running,
        ticket_id: ticket_id.clone(),
        task_description,
        started_at: now,
        model: model.clone(),
    };

    // Store session handle
    {
        let mut store =
            sessions().lock().map_err(|e| format!("spawn_claude_session: lock error: {}", e))?;
        store.insert(
            session_id.clone(),
            SessionHandle {
                info: session.clone(),
                stdin: Some(Arc::clone(&stdin)),
                output_lines: Vec::new(),
                abort_handle: None,
            },
        );
    }

    // Send initial prompt via stdin as JSON
    let initial_message = serde_json::json!({
        "type": "user",
        "content": prompt,
    });
    {
        let mut stdin_lock = stdin.lock().await;
        let msg = format!("{}\n", initial_message);
        stdin_lock
            .write_all(msg.as_bytes())
            .await
            .map_err(|e| format!("spawn_claude_session: failed to write initial prompt: {}", e))?;
        stdin_lock
            .flush()
            .await
            .map_err(|e| format!("spawn_claude_session: failed to flush stdin: {}", e))?;
    }

    // Spawn background task to read stdout and emit events
    let sid_stdout = session_id.clone();
    let app_stdout = app.clone();
    let stdout_task = tokio::spawn(async move {
        let reader = BufReader::new(stdout);
        let mut lines = reader.lines();

        while let Ok(Some(line)) = lines.next_line().await {
            if line.trim().is_empty() {
                continue;
            }

            // Try to extract text content from stream-json events
            let content = extract_content_from_stream_json(&line);
            if content.is_empty() {
                continue;
            }

            let output_line = SessionOutputLine {
                timestamp: chrono_now(),
                stream: "stdout".to_string(),
                content,
            };

            // Emit to frontend
            let _ = app_stdout.emit(
                "session-output",
                SessionOutputEvent { session_id: sid_stdout.clone(), line: output_line.clone() },
            );

            // Store in buffer
            if let Ok(mut store) = sessions().lock() {
                if let Some(handle) = store.get_mut(&sid_stdout) {
                    handle.output_lines.push(output_line);
                }
            }
        }
    });

    // Spawn background task to read stderr
    let sid_stderr = session_id.clone();
    let app_stderr = app.clone();
    tokio::spawn(async move {
        let reader = BufReader::new(stderr);
        let mut lines = reader.lines();

        while let Ok(Some(line)) = lines.next_line().await {
            if line.trim().is_empty() {
                continue;
            }

            let output_line = SessionOutputLine {
                timestamp: chrono_now(),
                stream: "stderr".to_string(),
                content: line,
            };

            let _ = app_stderr.emit(
                "session-output",
                SessionOutputEvent { session_id: sid_stderr.clone(), line: output_line.clone() },
            );

            if let Ok(mut store) = sessions().lock() {
                if let Some(handle) = store.get_mut(&sid_stderr) {
                    handle.output_lines.push(output_line);
                }
            }
        }
    });

    // Store abort handle for cleanup
    {
        let mut store =
            sessions().lock().map_err(|e| format!("spawn_claude_session: lock error: {}", e))?;
        if let Some(handle) = store.get_mut(&session_id) {
            handle.abort_handle = Some(stdout_task.abort_handle());
        }
    }

    // Spawn task to wait for process exit and update status
    let sid_exit = session_id.clone();
    let app_exit = app.clone();
    tokio::spawn(async move {
        let exit_status = child.wait().await;

        let new_status = match exit_status {
            Ok(status) if status.success() => SessionStatus::Completed,
            _ => SessionStatus::Failed,
        };

        if let Ok(mut store) = sessions().lock() {
            if let Some(handle) = store.get_mut(&sid_exit) {
                // Only update if still running or waiting
                if handle.info.status == SessionStatus::Running
                    || handle.info.status == SessionStatus::WaitingForInput
                {
                    handle.info.status = new_status.clone();
                    handle.stdin = None; // Process is done, no more input
                }
            }
        }

        let _ = app_exit.emit(
            "session-status-changed",
            SessionStatusEvent { session_id: sid_exit, status: new_status },
        );
    });

    Ok(session)
}

#[tauri::command]
pub async fn send_session_input(
    app: tauri::AppHandle,
    session_id: String,
    message: String,
) -> Result<(), String> {
    // Get the stdin handle
    let stdin = {
        let mut store =
            sessions().lock().map_err(|e| format!("send_session_input: lock error: {}", e))?;

        let handle = store
            .get_mut(&session_id)
            .ok_or_else(|| format!("send_session_input: session '{}' not found", session_id))?;

        // Record user input in output buffer
        let user_line = SessionOutputLine {
            timestamp: chrono_now(),
            stream: "user_input".to_string(),
            content: message.clone(),
        };
        handle.output_lines.push(user_line.clone());

        // Emit user input event so frontend shows it immediately
        let _ = app.emit(
            "session-output",
            SessionOutputEvent { session_id: session_id.clone(), line: user_line },
        );

        // Update status to running
        handle.info.status = SessionStatus::Running;
        let _ = app.emit(
            "session-status-changed",
            SessionStatusEvent { session_id: session_id.clone(), status: SessionStatus::Running },
        );

        handle
            .stdin
            .as_ref()
            .ok_or_else(|| {
                "send_session_input: session has no active stdin (process may have exited)"
                    .to_string()
            })?
            .clone()
    };

    // Write message as JSON to stdin
    let input_message = serde_json::json!({
        "type": "user",
        "content": message,
    });

    let mut stdin_lock = stdin.lock().await;
    let msg = format!("{}\n", input_message);
    stdin_lock
        .write_all(msg.as_bytes())
        .await
        .map_err(|e| format!("send_session_input: failed to write: {}", e))?;
    stdin_lock.flush().await.map_err(|e| format!("send_session_input: failed to flush: {}", e))?;

    Ok(())
}

#[tauri::command]
pub async fn get_session_output(session_id: String) -> Result<Vec<SessionOutputLine>, String> {
    let store = sessions().lock().map_err(|e| format!("get_session_output: lock error: {}", e))?;

    let handle = store
        .get(&session_id)
        .ok_or_else(|| format!("get_session_output: session '{}' not found", session_id))?;

    Ok(handle.output_lines.clone())
}

#[tauri::command]
pub async fn get_active_sessions() -> Result<Vec<AiSession>, String> {
    let store = sessions().lock().map_err(|e| format!("get_active_sessions: lock error: {}", e))?;

    Ok(store.values().map(|h| h.info.clone()).collect())
}

#[tauri::command]
pub async fn stop_session(app: tauri::AppHandle, session_id: String) -> Result<String, String> {
    let (stdin_opt, abort_opt) = {
        let mut store =
            sessions().lock().map_err(|e| format!("stop_session: lock error: {}", e))?;

        let handle = store
            .get_mut(&session_id)
            .ok_or_else(|| format!("stop_session: session '{}' not found", session_id))?;

        handle.info.status = SessionStatus::Stopped;
        let stdin = handle.stdin.take();
        let abort = handle.abort_handle.take();
        (stdin, abort)
    };

    // Close stdin to signal the process to exit
    if let Some(stdin) = stdin_opt {
        let mut stdin_lock = stdin.lock().await;
        let _ = stdin_lock.shutdown().await;
    }

    // Abort the stdout reader task
    if let Some(abort) = abort_opt {
        abort.abort();
    }

    let _ = app.emit(
        "session-status-changed",
        SessionStatusEvent { session_id: session_id.clone(), status: SessionStatus::Stopped },
    );

    Ok(format!("Session '{}' stopped", session_id))
}

// ---------------------------------------------------------------------------
// Stream JSON parsing
// ---------------------------------------------------------------------------

/// Extract readable text content from Claude CLI stream-json events.
/// The stream-json format emits various event types; we extract the text.
fn extract_content_from_stream_json(json_line: &str) -> String {
    let parsed: serde_json::Value = match serde_json::from_str(json_line) {
        Ok(v) => v,
        Err(_) => return json_line.to_string(), // Not JSON, return raw
    };

    // Handle different stream-json event types
    let event_type = parsed.get("type").and_then(|t| t.as_str()).unwrap_or("");

    match event_type {
        // Content block delta — contains incremental text
        "content_block_delta" => parsed
            .get("delta")
            .and_then(|d| d.get("text"))
            .and_then(|t| t.as_str())
            .unwrap_or("")
            .to_string(),

        // Assistant message with content array
        "assistant" | "message" => {
            if let Some(content) = parsed.get("content") {
                if let Some(arr) = content.as_array() {
                    arr.iter()
                        .filter_map(|block| {
                            if block.get("type").and_then(|t| t.as_str()) == Some("text") {
                                block.get("text").and_then(|t| t.as_str())
                            } else {
                                None
                            }
                        })
                        .collect::<Vec<_>>()
                        .join("")
                } else if let Some(s) = content.as_str() {
                    s.to_string()
                } else {
                    String::new()
                }
            } else {
                String::new()
            }
        }

        // Result message — final output
        "result" => parsed.get("result").and_then(|r| r.as_str()).unwrap_or("").to_string(),

        // Tool use events — show what the agent is doing
        "tool_use" => {
            let tool_name = parsed.get("name").and_then(|n| n.as_str()).unwrap_or("unknown");
            format!("[Using tool: {}]", tool_name)
        }

        // System/error events
        "error" => {
            let msg = parsed
                .get("error")
                .and_then(|e| e.get("message"))
                .and_then(|m| m.as_str())
                .unwrap_or("Unknown error");
            format!("[Error: {}]", msg)
        }

        // For unrecognized types, check if there's a text field
        _ => {
            if let Some(text) = parsed.get("text").and_then(|t| t.as_str()) {
                text.to_string()
            } else if let Some(content) = parsed.get("content").and_then(|c| c.as_str()) {
                content.to_string()
            } else {
                // Skip meta events like message_start, message_stop, ping
                String::new()
            }
        }
    }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

fn uuid_v4() -> String {
    use std::time::{SystemTime, UNIX_EPOCH};
    let d = SystemTime::now().duration_since(UNIX_EPOCH).unwrap_or_default();
    let seed = d.as_nanos();
    format!(
        "{:08x}-{:04x}-4{:03x}-{:04x}-{:012x}",
        (seed & 0xFFFF_FFFF) as u32,
        ((seed >> 32) & 0xFFFF) as u16,
        ((seed >> 48) & 0x0FFF) as u16,
        (((seed >> 60) & 0x3F) | 0x80) as u16 | (((seed >> 66) & 0xFF) << 8) as u16,
        (seed.wrapping_mul(6364136223846793005).wrapping_add(1)) & 0xFFFF_FFFF_FFFF,
    )
}

fn chrono_now() -> String {
    use std::time::{SystemTime, UNIX_EPOCH};
    let d = SystemTime::now().duration_since(UNIX_EPOCH).unwrap_or_default();
    let secs = d.as_secs();
    let days = secs / 86400;
    let time_of_day = secs % 86400;
    let hours = time_of_day / 3600;
    let minutes = (time_of_day % 3600) / 60;
    let seconds = time_of_day % 60;

    let mut y = 1970i64;
    let mut remaining = days as i64;
    loop {
        let days_in_year = if is_leap(y) { 366 } else { 365 };
        if remaining < days_in_year {
            break;
        }
        remaining -= days_in_year;
        y += 1;
    }
    let leap = is_leap(y);
    let month_days: [i64; 12] =
        [31, if leap { 29 } else { 28 }, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    let mut m = 0usize;
    for (i, &md) in month_days.iter().enumerate() {
        if remaining < md {
            m = i;
            break;
        }
        remaining -= md;
    }

    format!(
        "{:04}-{:02}-{:02}T{:02}:{:02}:{:02}Z",
        y,
        m + 1,
        remaining + 1,
        hours,
        minutes,
        seconds
    )
}

fn is_leap(y: i64) -> bool {
    (y % 4 == 0 && y % 100 != 0) || y % 400 == 0
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn ai_session_serialization_roundtrip() {
        let session = AiSession {
            id: "sess-001".to_string(),
            status: SessionStatus::Running,
            ticket_id: Some("SER-100".to_string()),
            task_description: "Fix the login bug".to_string(),
            started_at: "2026-01-01T00:00:00Z".to_string(),
            model: Some("claude-sonnet-4-6".to_string()),
        };

        let json = serde_json::to_string(&session).expect("serialize AiSession");
        let deserialized: AiSession = serde_json::from_str(&json).expect("deserialize AiSession");

        assert_eq!(deserialized.id, "sess-001");
        assert_eq!(deserialized.task_description, "Fix the login bug");
        assert_eq!(deserialized.ticket_id, Some("SER-100".to_string()));
    }

    #[test]
    fn session_status_includes_waiting_for_input() {
        let status = SessionStatus::WaitingForInput;
        let json = serde_json::to_string(&status).unwrap();
        assert_eq!(json, "\"waiting_for_input\"");

        let deserialized: SessionStatus = serde_json::from_str("\"waiting_for_input\"").unwrap();
        assert!(matches!(deserialized, SessionStatus::WaitingForInput));
    }

    #[test]
    fn session_status_all_variants_serialize() {
        let variants = vec![
            (SessionStatus::Running, "\"running\""),
            (SessionStatus::WaitingForInput, "\"waiting_for_input\""),
            (SessionStatus::Completed, "\"completed\""),
            (SessionStatus::Failed, "\"failed\""),
            (SessionStatus::Stopped, "\"stopped\""),
        ];

        for (status, expected) in variants {
            let json = serde_json::to_string(&status).unwrap();
            assert_eq!(json, expected);
        }
    }

    #[test]
    fn session_output_line_serialization() {
        let line = SessionOutputLine {
            timestamp: "2026-01-01T00:00:00Z".to_string(),
            stream: "stdout".to_string(),
            content: "Hello from Claude".to_string(),
        };

        let json = serde_json::to_string(&line).unwrap();
        let deserialized: SessionOutputLine = serde_json::from_str(&json).unwrap();
        assert_eq!(deserialized.stream, "stdout");
        assert_eq!(deserialized.content, "Hello from Claude");
    }

    #[test]
    fn session_output_event_serialization() {
        let event = SessionOutputEvent {
            session_id: "sess-001".to_string(),
            line: SessionOutputLine {
                timestamp: "2026-01-01T00:00:00Z".to_string(),
                stream: "stdout".to_string(),
                content: "test".to_string(),
            },
        };

        let json = serde_json::to_string(&event).unwrap();
        assert!(json.contains("sess-001"));
    }

    #[test]
    fn extract_content_block_delta() {
        let json = r#"{"type":"content_block_delta","delta":{"text":"Hello world"}}"#;
        assert_eq!(extract_content_from_stream_json(json), "Hello world");
    }

    #[test]
    fn extract_tool_use() {
        let json = r#"{"type":"tool_use","name":"Edit"}"#;
        assert_eq!(extract_content_from_stream_json(json), "[Using tool: Edit]");
    }

    #[test]
    fn extract_error_event() {
        let json = r#"{"type":"error","error":{"message":"Rate limited"}}"#;
        assert_eq!(extract_content_from_stream_json(json), "[Error: Rate limited]");
    }

    #[test]
    fn extract_empty_for_meta_events() {
        let json = r#"{"type":"message_start"}"#;
        assert_eq!(extract_content_from_stream_json(json), "");
    }

    #[test]
    fn extract_non_json_returns_raw() {
        let raw = "This is not JSON";
        assert_eq!(extract_content_from_stream_json(raw), raw);
    }

    #[test]
    fn session_store_operations() {
        {
            let mut store = sessions().lock().unwrap();
            store.clear();
        }

        let session = AiSession {
            id: "test-interactive".to_string(),
            status: SessionStatus::Running,
            ticket_id: None,
            task_description: "test task".to_string(),
            started_at: "2026-01-01T00:00:00Z".to_string(),
            model: None,
        };

        {
            let mut store = sessions().lock().unwrap();
            store.insert(
                session.id.clone(),
                SessionHandle {
                    info: session.clone(),
                    stdin: None,
                    output_lines: Vec::new(),
                    abort_handle: None,
                },
            );
        }

        let store = sessions().lock().unwrap();
        assert!(store.contains_key("test-interactive"));
    }

    #[test]
    fn session_output_buffer_accumulates() {
        {
            let mut store = sessions().lock().unwrap();
            store.clear();
            store.insert(
                "buff-test".to_string(),
                SessionHandle {
                    info: AiSession {
                        id: "buff-test".to_string(),
                        status: SessionStatus::Running,
                        ticket_id: None,
                        task_description: "buffer test".to_string(),
                        started_at: "2026-01-01T00:00:00Z".to_string(),
                        model: None,
                    },
                    stdin: None,
                    output_lines: Vec::new(),
                    abort_handle: None,
                },
            );
        }

        {
            let mut store = sessions().lock().unwrap();
            if let Some(handle) = store.get_mut("buff-test") {
                handle.output_lines.push(SessionOutputLine {
                    timestamp: chrono_now(),
                    stream: "stdout".to_string(),
                    content: "line 1".to_string(),
                });
                handle.output_lines.push(SessionOutputLine {
                    timestamp: chrono_now(),
                    stream: "stdout".to_string(),
                    content: "line 2".to_string(),
                });
            }
        }

        let store = sessions().lock().unwrap();
        let handle = store.get("buff-test").unwrap();
        assert_eq!(handle.output_lines.len(), 2);
        assert_eq!(handle.output_lines[0].content, "line 1");
    }

    #[test]
    fn uuid_v4_format() {
        let id = uuid_v4();
        assert_eq!(id.len(), 36);
        assert_eq!(id.chars().filter(|c| *c == '-').count(), 4);
    }

    #[test]
    fn chrono_now_format() {
        let now = chrono_now();
        assert!(now.ends_with('Z'));
        assert!(now.contains('T'));
        assert_eq!(now.len(), 20);
    }

    #[test]
    fn is_leap_year_checks() {
        assert!(is_leap(2000));
        assert!(is_leap(2024));
        assert!(!is_leap(1900));
        assert!(!is_leap(2023));
    }
}
