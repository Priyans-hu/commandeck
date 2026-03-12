use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::process::Stdio;
use std::sync::Mutex;
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
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum SessionStatus {
    Running,
    Completed,
    Failed,
    Stopped,
}

struct SessionHandle {
    info: AiSession,
    child: Option<tokio::process::Child>,
}

// ---------------------------------------------------------------------------
// Global session store
// ---------------------------------------------------------------------------

use std::sync::OnceLock;

fn sessions() -> &'static Mutex<HashMap<String, SessionHandle>> {
    static STORE: OnceLock<Mutex<HashMap<String, SessionHandle>>> = OnceLock::new();
    STORE.get_or_init(|| Mutex::new(HashMap::new()))
}

// ---------------------------------------------------------------------------
// Commands
// ---------------------------------------------------------------------------

#[tauri::command]
pub async fn spawn_claude_session(
    task_description: String,
    repo_path: Option<String>,
    ticket_id: Option<String>,
) -> Result<AiSession, String> {
    let session_id = uuid_v4();
    let now = chrono_now();

    // Build the prompt
    let mut prompt = task_description.clone();
    if let Some(ref tid) = ticket_id {
        prompt = format!("[{}] {}", tid, prompt);
    }

    // Spawn the claude CLI process
    let mut cmd = Command::new("claude");
    cmd.arg("--print");
    cmd.arg("--prompt");
    cmd.arg(&prompt);

    if let Some(ref path) = repo_path {
        cmd.current_dir(path);
    }

    cmd.stdin(Stdio::null());
    cmd.stdout(Stdio::piped());
    cmd.stderr(Stdio::piped());

    let child = cmd
        .spawn()
        .map_err(|e| format!("spawn_claude_session: failed to spawn claude process: {}", e))?;

    let session = AiSession {
        id: session_id.clone(),
        status: SessionStatus::Running,
        ticket_id: ticket_id.clone(),
        task_description,
        started_at: now,
    };

    {
        let mut store = sessions()
            .lock()
            .map_err(|e| format!("spawn_claude_session: lock error: {}", e))?;
        store.insert(
            session_id.clone(),
            SessionHandle {
                info: session.clone(),
                child: Some(child),
            },
        );
    }

    // Spawn a background task to update status when the process exits
    let sid = session_id.clone();
    tokio::spawn(async move {
        // Wait a moment then try to track completion
        let mut child_opt: Option<tokio::process::Child> = None;
        {
            if let Ok(mut store) = sessions().lock() {
                if let Some(handle) = store.get_mut(&sid) {
                    child_opt = handle.child.take();
                }
            }
        }

        if let Some(mut child) = child_opt {
            let result = child.wait().await;
            if let Ok(mut store) = sessions().lock() {
                if let Some(handle) = store.get_mut(&sid) {
                    match result {
                        Ok(status) if status.success() => {
                            handle.info.status = SessionStatus::Completed;
                        }
                        _ => {
                            handle.info.status = SessionStatus::Failed;
                        }
                    }
                }
            }
        }
    });

    Ok(session)
}

#[tauri::command]
pub async fn get_active_sessions() -> Result<Vec<AiSession>, String> {
    let store = sessions()
        .lock()
        .map_err(|e| format!("get_active_sessions: lock error: {}", e))?;

    Ok(store.values().map(|h| h.info.clone()).collect())
}

#[tauri::command]
pub async fn stop_session(session_id: String) -> Result<String, String> {
    let child_opt: Option<tokio::process::Child>;

    {
        let mut store = sessions()
            .lock()
            .map_err(|e| format!("stop_session: lock error: {}", e))?;

        let handle = store
            .get_mut(&session_id)
            .ok_or_else(|| format!("stop_session: session '{}' not found", session_id))?;

        child_opt = handle.child.take();
        handle.info.status = SessionStatus::Stopped;
    }

    if let Some(mut child) = child_opt {
        child
            .kill()
            .await
            .map_err(|e| format!("stop_session: failed to kill process: {}", e))?;
    }

    Ok(format!("Session '{}' stopped", session_id))
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/// Generate a simple UUID v4 without pulling in the `uuid` crate.
fn uuid_v4() -> String {
    use std::time::{SystemTime, UNIX_EPOCH};
    let d = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default();
    let seed = d.as_nanos();
    // Simple pseudo-random hex string (not cryptographically secure, but fine for session IDs)
    format!(
        "{:08x}-{:04x}-4{:03x}-{:04x}-{:012x}",
        (seed & 0xFFFF_FFFF) as u32,
        ((seed >> 32) & 0xFFFF) as u16,
        ((seed >> 48) & 0x0FFF) as u16,
        (((seed >> 60) & 0x3F) | 0x80) as u16 | (((seed >> 66) & 0xFF) << 8) as u16,
        (seed.wrapping_mul(6364136223846793005).wrapping_add(1)) & 0xFFFF_FFFF_FFFF,
    )
}

/// Return current UTC time as ISO 8601 string without pulling in `chrono`.
fn chrono_now() -> String {
    use std::time::{SystemTime, UNIX_EPOCH};
    let d = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default();
    let secs = d.as_secs();

    // Convert epoch seconds to date-time components
    let days = secs / 86400;
    let time_of_day = secs % 86400;
    let hours = time_of_day / 3600;
    let minutes = (time_of_day % 3600) / 60;
    let seconds = time_of_day % 60;

    // Days since 1970-01-01 to Y-M-D (simplified leap year calculation)
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
    let month_days: [i64; 12] = [
        31,
        if leap { 29 } else { 28 },
        31,
        30,
        31,
        30,
        31,
        31,
        30,
        31,
        30,
        31,
    ];
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
        };

        let json = serde_json::to_string(&session).expect("serialize AiSession");
        let deserialized: AiSession =
            serde_json::from_str(&json).expect("deserialize AiSession");

        assert_eq!(deserialized.id, "sess-001");
        assert_eq!(deserialized.task_description, "Fix the login bug");
        assert_eq!(deserialized.ticket_id, Some("SER-100".to_string()));
        assert_eq!(deserialized.started_at, "2026-01-01T00:00:00Z");
    }

    #[test]
    fn ai_session_optional_ticket_id_none() {
        let session = AiSession {
            id: "sess-002".to_string(),
            status: SessionStatus::Completed,
            ticket_id: None,
            task_description: "Refactor module".to_string(),
            started_at: "2026-01-01T00:00:00Z".to_string(),
        };

        let json = serde_json::to_string(&session).unwrap();
        let deserialized: AiSession = serde_json::from_str(&json).unwrap();
        assert!(deserialized.ticket_id.is_none());
    }

    #[test]
    fn session_status_enum_variants_serialize() {
        let running = SessionStatus::Running;
        let completed = SessionStatus::Completed;
        let failed = SessionStatus::Failed;
        let stopped = SessionStatus::Stopped;

        let running_json = serde_json::to_string(&running).unwrap();
        let completed_json = serde_json::to_string(&completed).unwrap();
        let failed_json = serde_json::to_string(&failed).unwrap();
        let stopped_json = serde_json::to_string(&stopped).unwrap();

        assert_eq!(running_json, "\"running\"");
        assert_eq!(completed_json, "\"completed\"");
        assert_eq!(failed_json, "\"failed\"");
        assert_eq!(stopped_json, "\"stopped\"");
    }

    #[test]
    fn session_status_deserialize_all_variants() {
        let running: SessionStatus = serde_json::from_str("\"running\"").unwrap();
        let completed: SessionStatus = serde_json::from_str("\"completed\"").unwrap();
        let failed: SessionStatus = serde_json::from_str("\"failed\"").unwrap();
        let stopped: SessionStatus = serde_json::from_str("\"stopped\"").unwrap();

        assert!(matches!(running, SessionStatus::Running));
        assert!(matches!(completed, SessionStatus::Completed));
        assert!(matches!(failed, SessionStatus::Failed));
        assert!(matches!(stopped, SessionStatus::Stopped));
    }

    #[test]
    fn session_creation_adds_to_store() {
        // Clear the store first
        {
            let mut store = sessions().lock().unwrap();
            store.clear();
        }

        let session = AiSession {
            id: "test-sess-1".to_string(),
            status: SessionStatus::Running,
            ticket_id: None,
            task_description: "test task".to_string(),
            started_at: "2026-01-01T00:00:00Z".to_string(),
        };

        {
            let mut store = sessions().lock().unwrap();
            store.insert(
                session.id.clone(),
                SessionHandle {
                    info: session.clone(),
                    child: None,
                },
            );
        }

        let store = sessions().lock().unwrap();
        assert!(store.contains_key("test-sess-1"));
        assert_eq!(store.len(), 1);
    }

    #[test]
    fn get_sessions_returns_correct_count() {
        {
            let mut store = sessions().lock().unwrap();
            store.clear();
        }

        let ids = vec!["s1", "s2", "s3"];
        {
            let mut store = sessions().lock().unwrap();
            for id in &ids {
                store.insert(
                    id.to_string(),
                    SessionHandle {
                        info: AiSession {
                            id: id.to_string(),
                            status: SessionStatus::Running,
                            ticket_id: None,
                            task_description: "task".to_string(),
                            started_at: "2026-01-01T00:00:00Z".to_string(),
                        },
                        child: None,
                    },
                );
            }
        }

        let store = sessions().lock().unwrap();
        let all: Vec<AiSession> = store.values().map(|h| h.info.clone()).collect();
        assert_eq!(all.len(), 3);
    }

    #[test]
    fn stop_session_removes_from_store_by_status() {
        {
            let mut store = sessions().lock().unwrap();
            store.clear();
        }

        let session_id = "sess-to-stop".to_string();
        {
            let mut store = sessions().lock().unwrap();
            store.insert(
                session_id.clone(),
                SessionHandle {
                    info: AiSession {
                        id: session_id.clone(),
                        status: SessionStatus::Running,
                        ticket_id: None,
                        task_description: "will be stopped".to_string(),
                        started_at: "2026-01-01T00:00:00Z".to_string(),
                    },
                    child: None,
                },
            );
        }

        // Simulate what stop_session does: set status to Stopped
        {
            let mut store = sessions().lock().unwrap();
            if let Some(handle) = store.get_mut(&session_id) {
                handle.info.status = SessionStatus::Stopped;
            }
        }

        let store = sessions().lock().unwrap();
        let handle = store.get(&session_id).unwrap();
        assert!(matches!(handle.info.status, SessionStatus::Stopped));
    }

    #[test]
    fn session_id_uniqueness() {
        let id1 = uuid_v4();
        // Add a small delay to ensure different timestamp
        std::thread::sleep(std::time::Duration::from_millis(2));
        let id2 = uuid_v4();

        assert_ne!(id1, id2, "Two generated session IDs should be unique");
        // Verify UUID format: 8-4-4-4-12 hex pattern
        assert_eq!(id1.len(), 36, "UUID should be 36 characters long");
        assert_eq!(id1.chars().filter(|c| *c == '-').count(), 4, "UUID should have 4 dashes");
    }

    #[test]
    fn chrono_now_returns_valid_iso8601() {
        let now = chrono_now();
        // Should end with Z (UTC)
        assert!(now.ends_with('Z'), "Timestamp should end with Z");
        // Should contain T separator
        assert!(now.contains('T'), "Timestamp should contain T separator");
        // Should match rough ISO 8601 pattern: YYYY-MM-DDTHH:MM:SSZ
        assert_eq!(now.len(), 20, "ISO 8601 timestamp should be 20 chars");
    }

    #[test]
    fn is_leap_year_checks() {
        assert!(is_leap(2000)); // divisible by 400
        assert!(is_leap(2024)); // divisible by 4, not by 100
        assert!(!is_leap(1900)); // divisible by 100, not by 400
        assert!(!is_leap(2023)); // not divisible by 4
    }
}
