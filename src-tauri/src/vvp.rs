use std::{fs, path::PathBuf, str::FromStr};

use regex::Regex;
use tauri::api::process::{Command, Output};

use crate::{error::Error, state::State, util::to_utf8, vcd::VCDFile};

lazy_static::lazy_static! {
    static ref VCD_FILE_REGEX: Regex = Regex::new("^VCD info: dumpfile (.*) opened for output\\.$").unwrap();
}

#[tauri::command]
pub fn simulate(state: tauri::State<'_, State>) -> Result<Vec<VCDFile>, Error> {
    if let Some(project) = state.project() {
        run_simulation(
            &to_utf8(&project.output_directory())?,
            &to_utf8(&project.output_directory().join("a.out"))?,
        )
    } else {
        Err(Error::NoProject)
    }
}

pub fn run_simulation(executable: &str, output_directory: &str) -> Result<Vec<VCDFile>, Error> {
    tracing::info!("Starting simulation");
    tracing::debug!(executable, output_directory);

    // TODO: Check why ../ is needed
    let output: Output = Command::new_sidecar("../vvp")
        .expect("Could not find vvp sidecar")
        .args([executable])
        .current_dir(PathBuf::from(output_directory))
        .output()?;

    tracing::info!("vvp exited with {:?}", output.status.code());
    if output.status.code().is_some_and(|v| v != 0) {
        return Err(Error::Other(format!(
            "Could not simulate with vvp (exit code {:?})",
            output.status.code(),
        )));
    }

    output
        .stdout
        .split('\n')
        .filter_map(|line| {
            VCD_FILE_REGEX
                .captures(line)
                .map(|captures| -> Result<_, Error> {
                    let content = fs::read_to_string(&captures[1])?;
                    VCDFile::from_str(&content)
                        .map_err(|_| Error::Other("Could not parse VCD file".to_owned()))
                })
        })
        .try_fold(vec![], |mut vec, value| {
            vec.push(value?);
            Ok(vec)
        })
}
