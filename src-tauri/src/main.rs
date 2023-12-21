// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{path::PathBuf, sync::Mutex};

use config::APP_NAME;
use project::Project;
use state::{AppState, State};
use tauri::Manager;
use tauri_plugin_log::fern::colors::ColoredLevelConfig;

use crate::{
    icarus::{compile, simulate},
    project::{get_project_state, read_project_tree, set_project_state},
};

pub mod config;
pub mod consts;
pub mod error;
pub mod icarus;
pub mod project;
pub mod state;
pub mod util;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

fn main() {
    tauri::Builder::default()
        .plugin(
            tauri_plugin_log::Builder::default()
                .with_colors(ColoredLevelConfig::default())
                .build(),
        )
        .plugin(tauri_plugin_fs_watch::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            compile,
            simulate,
            read_project_tree,
            get_project_state,
            set_project_state
        ])
        .manage(Mutex::new(state::State::new(None)))
        .setup(|app| {
            for win in app.windows() {
                if let Some(project) = app.state::<Mutex<State>>().lock().unwrap().project() {
                    win.1
                        .set_title(format!("{APP_NAME} - {}", project.name).as_str())?;
                } else {
                    win.1.set_title(APP_NAME)?;
                }
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
