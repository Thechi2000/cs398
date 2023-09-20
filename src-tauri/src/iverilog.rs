//! Helper functions to manipulate the `iverilog` executable, to compile verilog files.

use lazy_static::lazy_static;
use regex::{Captures, Regex};
use std::{
    collections::HashMap,
    path::{Path, PathBuf},
    process,
};

use crate::error::Error;

const IVERILOG_EXE: &str = "iverilog";

lazy_static! {
    /// Matches a string with the format `main.verilog:5: syntax error`
    static ref COMPILATION_OUTPUT_RESULT: Regex = Regex::new("^(.*)+:(\\d+): (.*)$").unwrap();
    static ref COMPILATION_OUTPUT_IGNORED: Regex = Regex::new("^\\d+ error\\(s\\) during elaboration\\.|I give up\\.$").unwrap();
}

/// Outcome of the compilation, containing status and errors, and a handle to run a simulation
pub struct CompilationOutcome {
    executable_path: PathBuf,
    /// Status of the compilation
    pub status: CompilationStatus,
    /// Mapping of errors, grouped by files, then lines
    pub errors: ErrorMap,
}

/// Status of the compilation
pub enum CompilationStatus {
    Success,
    Failure,
}

type ErrorMap = HashMap<String, HashMap<u32, Vec<String>>>;

/// Parses a line from the output of the `iverilog` executable
fn parse_compilation_output_line(line: &str) -> Option<(String, u32, String)> {
    if let Some(cap) = COMPILATION_OUTPUT_RESULT.captures(line) {
        Some((cap[0].to_string(), cap[1].parse().ok()?, cap[2].to_string()))
    } else if COMPILATION_OUTPUT_IGNORED.find(line).is_some() {
        None
    } else {
        todo!("error log");
        None
    }
}

/// Parses the output of the `iverilog` executable
fn parse_compilation_output(out: &str) -> Result<ErrorMap, Error> {
    let mut error_map: HashMap<String, HashMap<u32, Vec<String>>> = HashMap::new();

    for line in out.split('\n').into_iter() {
        // Unparseable lines are considered a soft error, they are only logged
        if let Some(line) = parse_compilation_output_line(line) {
            match error_map.entry(line.0) {
                std::collections::hash_map::Entry::Occupied(mut file_entry) => {
                    match file_entry.get_mut().entry(line.1) {
                        std::collections::hash_map::Entry::Occupied(mut line_entry) => {
                            line_entry.get_mut().push(line.2);
                        }
                        std::collections::hash_map::Entry::Vacant(line_entry) => {
                            line_entry.insert(vec![line.2]);
                        }
                    }
                }
                std::collections::hash_map::Entry::Vacant(line_entry) => {
                    let mut file = HashMap::new();
                    file.insert(line.1, vec![line.2]);
                    line_entry.insert(file);
                }
            }
        }
    }

    Ok(error_map)
}

/// Compiles verilog files
/// - `files`: The complete list of files to be used for the compilation
/// - `output_directory`: The path of a directory to use for compilation results and cache
pub fn compile(files: &[&Path], output_directory: &Path) -> Result<CompilationOutcome, Error> {
    // TODO handle 'I give up.' and 'x error(s) during elaboration.'
    let output_executable = PathBuf::from(output_directory).join("a.out");

    let compilation_output = process::Command::new(IVERILOG_EXE)
        .args(files)
        .arg("-o")
        .arg(&output_executable)
        .output()?;

    if compilation_output.status.success() {
        Ok(CompilationOutcome {
            executable_path: output_executable,
            status: CompilationStatus::Success,
            errors: ErrorMap::default(),
        })
    } else {
        let Ok(out) = std::str::from_utf8(&compilation_output.stderr) else {
            return Err(Error::Other(
                "Unable to convert iverilog output to utf8".into(),
            ));
        };

        Ok(CompilationOutcome {
            executable_path: output_executable,
            status: CompilationStatus::Failure,
            errors: parse_compilation_output(out)?,
        })
    }
}
