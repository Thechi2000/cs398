//! Helper functions to manipulate the `iverilog` executable, to compile verilog files.

use lazy_static::lazy_static;
use regex::Regex;
use std::{
    collections::HashMap,
    path::{Path, PathBuf},
    process,
};

use crate::error::Error;

const IVERILOG_EXE: &str = "../iverilog/driver/iverilog";

lazy_static! {
    /// Matches a string with the format `main.verilog:5: syntax error`
    static ref COMPILATION_OUTPUT_RESULT: Regex = Regex::new("^(.*)+:(\\d+): (.*)$").unwrap();
    static ref COMPILATION_OUTPUT_IGNORED: Regex = Regex::new("^\\d+ error\\(s\\) during elaboration\\.|I give up\\.$").unwrap();
}

/// Outcome of the compilation, containing status and errors, and a handle to run a simulation
#[derive(Debug)]
pub struct CompilationOutcome {
    executable_path: PathBuf,
    /// Status of the compilation
    pub status: CompilationStatus,
    /// Mapping of errors, grouped by files, then lines
    pub errors: ErrorMap,
}

/// Status of the compilation
#[derive(Debug, PartialEq, Eq)]
pub enum CompilationStatus {
    Success,
    Failure,
}

type ErrorMap = HashMap<String, HashMap<u32, Vec<String>>>;

/// Parses a line from the output of the `iverilog` executable
fn parse_compilation_output_line(line: &str) -> Option<(String, u32, String)> {
    let line = line.trim();
    tracing::debug!(line);

    if let Some(cap) = COMPILATION_OUTPUT_RESULT.captures(line) {
        Some((cap[1].to_string(), cap[2].parse().ok()?, cap[3].to_string()))
    } else if COMPILATION_OUTPUT_IGNORED.find(line).is_some() {
        None
    } else {
        tracing::warn!("Unparsable line: {}", line);
        None
    }
}

/// Parses the output of the `iverilog` executable
fn parse_compilation_output(out: &str) -> Result<ErrorMap, Error> {
    let mut error_map: HashMap<String, HashMap<u32, Vec<String>>> = HashMap::new();

    for line in out.split('\n') {
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
#[tracing::instrument(name = "compilation")]
pub fn compile(files: &[&Path], output_directory: &Path) -> Result<CompilationOutcome, Error> {
    tracing::debug!(
        "output directory: {}, files: {:?}",
        output_directory.display(),
        files.iter().map(|f| f.display()).collect::<Vec<_>>()
    );

    let output_executable = PathBuf::from(output_directory).join("a.out");

    let compilation_output = process::Command::new(IVERILOG_EXE)
        .args(files)
        .arg("-o")
        .arg(&output_executable)
        .output()?;

    tracing::info!(
        "iverilog exited with {:?}",
        compilation_output.status.code()
    );

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

#[cfg(test)]
mod test {
    use super::*;

    #[test]
    fn test_line_parsing_ignored() {
        assert!(parse_compilation_output_line("I give up.").is_none());
        assert!(parse_compilation_output_line("3 error(s) during elaboration.").is_none());
    }
    #[test]
    fn test_line_parsing() {
        assert_eq!(
            parse_compilation_output_line("file.vhd:5: syntax error"),
            Some(("file.vhd".to_owned(), 5, "syntax error".to_owned()))
        );
    }
    #[test]
    fn test_line_parsing_with_spaces() {
        assert_eq!(
            parse_compilation_output_line("file with spaces:1236: syntax error"),
            Some((
                "file with spaces".to_owned(),
                1236,
                "syntax error".to_owned()
            ))
        );
    }
    #[test]
    fn test_line_parsing_weird_error() {
        assert_eq!(
            parse_compilation_output_line("file with spaces:1236: we1rd 3rr*r"),
            Some((
                "file with spaces".to_owned(),
                1236,
                "we1rd 3rr*r".to_owned()
            ))
        );
    }

    #[test]
    fn test_line_parsing_with_colons() {
        assert_eq!(
            parse_compilation_output_line("file:with:colons.vhd:5: syntax error"),
            Some((
                "file:with:colons.vhd".to_owned(),
                5,
                "syntax error".to_owned()
            ))
        );
    }
    #[test]
    fn test_line_parsing_with_message_type() {
        assert_eq!(
            parse_compilation_output_line("file.vhd:5: error: syntax error"),
            Some(("file.vhd".to_owned(), 5, "error: syntax error".to_owned()))
        );
    }

    #[test]
    fn test_full_output_parsing() {
        let res = parse_compilation_output(
            r#"
                test:asdf  :3.verilog:4: syntax error
                test:asdf  :3.verilog:1: Errors in port declarations.
                test:asdf  :3.verilog:6: syntax error
                test:asdf  :3.verilog:6: error: Malformed event control expression.
                test:asdf  :3.verilog:13: syntax error
                test:asdf  :3.verilog:13: Syntax in assignment statement l-value.
                test:asdf  :3.verilog:6: error: Invalid event control.
                I give up.
            "#,
        );

        assert!(res.is_ok(), "error: {:?}", res);
        let res = res.unwrap();
        assert_eq!(res.keys().len(), 1);
        assert!(res.contains_key("test:asdf  :3.verilog"));

        let f1 = res.get("test:asdf  :3.verilog").unwrap();
        assert_eq!(f1.keys().len(), 4);
        assert!(f1.contains_key(&1));
        assert!(f1.contains_key(&4));
        assert!(f1.contains_key(&6));
        assert!(f1.contains_key(&13));

        let l1 = f1.get(&1).unwrap();
        let l4 = f1.get(&4).unwrap();
        let l6 = f1.get(&6).unwrap();
        let l13 = f1.get(&13).unwrap();

        assert_eq!(l1.len(), 1);
        assert!(l1.contains(&"Errors in port declarations.".to_owned()));

        assert_eq!(l4.len(), 1);
        assert!(l4.contains(&"syntax error".to_owned()));

        assert_eq!(l6.len(), 3);
        assert!(l6.contains(&"syntax error".to_owned()));
        assert!(l6.contains(&"error: Malformed event control expression.".to_owned()));
        assert!(l6.contains(&"error: Invalid event control.".to_owned()));

        assert_eq!(l13.len(), 2);
        assert!(l13.contains(&"syntax error".to_owned()));
        assert!(l13.contains(&"Syntax in assignment statement l-value.".to_owned()));
    }

    #[test]
    fn test_compilation_on_correct_file() {
        std::fs::create_dir_all("/tmp/verilog/out")
            .expect("Could not create out directory for compilation testing");
        let res = compile(
            &[PathBuf::from("tests/verilog/correct.verilog").as_path()],
            PathBuf::from("/tmp/verilog/out").as_path(),
        );

        assert!(res.is_ok(), "error: {:?}", res);
        let res = res.unwrap();

        assert_eq!(res.status, CompilationStatus::Success);
        assert!(res.errors.is_empty());
    }

    #[test]
    fn test_compilation_on_incorrect_file() {
        std::fs::create_dir_all("/tmp/verilog/out")
            .expect("Could not create out directory for compilation testing");
        let res = compile(
            &[PathBuf::from("tests/verilog/incorrect.verilog").as_path()],
            PathBuf::from("/tmp/verilog/out").as_path(),
        );

        assert!(res.is_ok(), "error: {:?}", res);
        let res = res.unwrap();

        assert_eq!(res.status, CompilationStatus::Failure);
        assert!(!res.errors.is_empty());
    }

    #[test]
    fn test_compilation_on_inexistant_file() {
        std::fs::create_dir_all("/tmp/verilog/out")
            .expect("Could not create out directory for compilation testing");
        let res = compile(
            &[PathBuf::from("tests/verilog/not there.verilog").as_path()],
            PathBuf::from("/tmp/verilog/out").as_path(),
        );
        assert!(res.is_err(), "value: {:?}", res);
    }
}
