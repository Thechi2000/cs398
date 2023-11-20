use std::path::PathBuf;

fn main() {
    std::fs::create_dir_all(PathBuf::from("../dist")).expect("Could not create ../dist directory");

    tauri_build::build()
}
