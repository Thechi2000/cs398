use std::path::PathBuf;

fn main() {
    if !PathBuf::from("../iverilog-build").exists() {
        let res = std::process::Command::new("sh")
            .current_dir(PathBuf::from(".."))
            .arg("build-iverilog.sh")
            .output()
            .expect("Could not build iverilog (IO Error)");

        if !res.status.success() {
            println!("Could not build iverilog (code: {:?}):", res.status.code());

            if let Ok(str) = std::str::from_utf8(&res.stdout) {
                println!("STDOUT:\n{}", str);
            }

            if let Ok(str) = std::str::from_utf8(&res.stderr) {
                println!("STDERR:\n{}", str);
            }

            panic!();
        }
    }
    tauri_build::build()
}
