mod commands;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_sql::Builder::default().build())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_process::init())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::github::fetch_pull_requests,
            commands::github::fetch_pr_diff,
            commands::github::submit_pr_review,
            commands::linear::fetch_issues,
            commands::linear::update_issue_status,
            commands::linear::fetch_teams,
            commands::ai::spawn_claude_session,
            commands::ai::get_active_sessions,
            commands::ai::stop_session,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
