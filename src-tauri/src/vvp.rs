use std::{fs, path::PathBuf, process::Command, str::FromStr};

use regex::Regex;
use tauri::AppHandle;

use crate::{consts::VVP_EXE, error::Error, state::State, util::to_utf8, vcd::VCDFile};

lazy_static::lazy_static! {
    static ref VCD_FILE_REGEX: Regex = Regex::new("^VCD info: dumpfile (.*) opened for output\\.$").unwrap();
}

#[tauri::command]
pub fn simulate(state: tauri::State<'_, State>, app: AppHandle) -> Result<Vec<VCDFile>, Error> {
    if let Some(project) = state.project() {
        run_simulation(
            &to_utf8(&project.output_directory()?.join("a.out"))?,
            &to_utf8(&project.output_directory()?)?,
            app,
        )
    } else {
        Err(Error::NoProject)
    }
}

pub fn run_simulation(
    executable: &str,
    output_directory: &str,
    app: AppHandle,
) -> Result<Vec<VCDFile>, Error> {
    tracing::info!("Starting simulation");
    tracing::debug!("{output_directory}: {VVP_EXE} {executable}");

    let output = Command::new(
        app.path_resolver()
            .resolve_resource(VVP_EXE)
            .expect("Missing vvp executable"),
    )
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

    String::from_utf8_lossy(&output.stdout)
        .split('\n')
        .filter_map(|line| {
            VCD_FILE_REGEX
                .captures(line)
                .map(|captures| -> Result<_, Error> {
                    let content =
                        fs::read_to_string(PathBuf::from(output_directory).join(&captures[1]))?;
                    VCDFile::from_str(&content)
                        .map_err(|_| Error::Other("Could not parse VCD file".to_owned()))
                })
        })
        .try_fold(vec![], |mut vec, value| {
            vec.push(value?);
            Ok(vec)
        })
}
