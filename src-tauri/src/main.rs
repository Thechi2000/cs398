// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use config::APP_NAME;
use project::Project;
use tauri::Manager;
use tauri_plugin_log::fern::colors::ColoredLevelConfig;

use crate::{iverilog::compile, project::read_project_tree, vvp::simulate};

pub mod config;
pub mod error;
pub mod iverilog;
pub mod project;
pub mod state;
pub mod util;
pub mod vcd;
pub mod vvp;
pub mod consts;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

fn main() {
    let project = Project::from_dir("/home/ludovic/palusim-project/".to_owned());

    tauri::Builder::default()
        .plugin(
            tauri_plugin_log::Builder::default()
                .with_colors(ColoredLevelConfig::default())
                .build(),
        )
        .invoke_handler(tauri::generate_handler![
            greet,
            compile,
            simulate,
            read_project_tree
        ])
        .manage(state::State::new(Some(project)))
        .setup(|app| {
            for win in app.windows() {
                if let Some(project) = app.state::<state::State>().project() {
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
