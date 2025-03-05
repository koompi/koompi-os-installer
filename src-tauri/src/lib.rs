// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

use serde_json::Value;
use tokio::io::AsyncReadExt;
use tokio::process::Command;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn get_block_devices() -> std::result::Result<Value, String> {
    let cmd = Command::new("lsblk")
        .args(vec!["-o", "NAME,SIZE,TYPE,MOUNTPOINT,VENDOR,MODEL", "-J"])
        .output()
        .await
        .map_err(|e| e.to_string())?;

    let mut buffer = String::new();

    cmd.stdout
        .as_slice()
        .read_to_string(&mut buffer)
        .await
        .map_err(|e| e.to_string())?;

    serde_json::from_str(&buffer).map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, get_block_devices])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
