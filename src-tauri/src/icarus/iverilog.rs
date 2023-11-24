//! Helper functions to manipulate the `iverilog` executable, to compile verilog files.

use lazy_static::lazy_static;
use regex::Regex;
use serde::Serialize;
use std::{
    collections::HashMap,
    path::{Path, PathBuf},
    process::Command,
};
use tauri::AppHandle;

use crate::{consts::IVERILOG_EXE, error::Error, project::ProjectEntry, state::State};

lazy_static! {
    /// Matches a string with the format `main.verilog:5: syntax error`
    static ref COMPILATION_OUTPUT: Regex = Regex::new("^(.*?)+:(\\d+): (.*)$").unwrap();
    static ref COMPILATION_OUTPUT_WITHOUT_LINE_NO: Regex = Regex::new("^(.*?)+: (.*)$").unwrap();
    static ref COMPILATION_OUTPUT_IGNORED: Regex = Regex::new("^\\d+ error\\(s\\) during elaboration\\.|I give up\\.$").unwrap();
}

#[tauri::command]
pub fn compile(
    state: tauri::State<'_, State>,
    app: AppHandle,
) -> Result<CompilationOutcome, Error> {
    fn extract_pathes(entries: &[ProjectEntry]) -> Vec<&Path> {
        entries.iter().fold(vec![], |mut acc, e| {
            if e.children.is_empty() {
                acc.push(&e.path)
            } else {
                acc.append(&mut extract_pathes(&e.children))
            }
            acc
        })
    }

    if let Some(project) = state.project() {
        compile_inner(
            &extract_pathes(&project.read_project_tree(true)?.children),
            &project.output_directory()?,
            app,
        )
    } else {
        Err(Error::NoProject)
    }
}

/// Outcome of the compilation, containing status and errors, or a handle to run a simulation
#[derive(Debug, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub enum CompilationOutcome {
    Success {
        executable_path: PathBuf,
    },
    Failure {
        /// Mapping of errors, grouped by files, then lines
        errors: ErrorMap,
    },
}

type ErrorMap = HashMap<String, FileErrors>;

#[derive(Debug, Default, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FileErrors {
    pub global: Vec<String>,
    pub lines: HashMap<u32, Vec<String>>,
}

/// Parses a line from the output of the `iverilog` executable
fn parse_compilation_output_line(line: &str) -> Option<(String, Option<u32>, String)> {
    let line = line.trim();
    tracing::debug!(line);

    if COMPILATION_OUTPUT_IGNORED.find(line).is_some() {
        None
    } else if let Some(cap) = COMPILATION_OUTPUT.captures(line) {
        Some((
            cap[1].to_string(),
            Some(cap[2].parse().ok()?),
            cap[3].to_string(),
        ))
    } else if let Some(cap) = COMPILATION_OUTPUT_WITHOUT_LINE_NO.captures(line) {
        Some((cap[1].to_string(), None, cap[2].to_string()))
    } else {
        tracing::warn!("Unparsable line: {}", line);
        None
    }
}

/// Parses the output of the `iverilog` executable
fn parse_compilation_output(out: &str) -> Result<ErrorMap, Error> {
    let mut error_map: ErrorMap = HashMap::new();

    for line in out.split('\n') {
        // Unparseable lines are considered a soft error, they are only logged
        if let Some(line) = parse_compilation_output_line(line) {
            match error_map.entry(line.0) {
                std::collections::hash_map::Entry::Occupied(mut file_entry) => {
                    if let Some(line_no) = line.1 {
                        match file_entry.get_mut().lines.entry(line_no) {
                            std::collections::hash_map::Entry::Occupied(mut line_entry) => {
                                line_entry.get_mut().push(line.2);
                            }
                            std::collections::hash_map::Entry::Vacant(line_entry) => {
                                line_entry.insert(vec![line.2]);
                            }
                        }
                    } else {
                        file_entry.get_mut().global.push(line.2);
                    }
                }
                std::collections::hash_map::Entry::Vacant(line_entry) => {
                    let mut file = FileErrors::default();
                    if let Some(line_no) = line.1 {
                        file.lines.insert(line_no, vec![line.2]);
                    } else {
                        file.global.push(line.2);
                    }
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
///
/// Note: For correct output parsing, the files' path should not contain colons.
#[tracing::instrument(name = "compilation")]
pub fn compile_inner(
    files: &[&Path],
    output_directory: &Path,
    app: AppHandle,
) -> Result<CompilationOutcome, Error> {
    tracing::info!("Starting compilation");
    tracing::debug!(
        "output directory: {:?}, files: {:?}",
        output_directory,
        files.iter().collect::<Vec<_>>()
    );

    // Check that all files have valid Unicode names and do not contain colons
    if files.iter().any(|p| p.to_string_lossy().contains(':')) {
        return Ok(CompilationOutcome::Failure {
            errors: files
                .iter()
                .filter(|&f| f.to_string_lossy().contains(':'))
                .map(|f| {
                    (
                        f.to_string_lossy().to_string(),
                        FileErrors {
                            global: vec!["Filename cannot contains colons".to_owned()],
                            ..Default::default()
                        },
                    )
                })
                .fold(HashMap::new(), |mut m, v| {
                    m.insert(v.0, v.1);
                    m
                }),
        });
    }

    let output_executable = PathBuf::from(output_directory).join("a.out");

    let compilation_output = Command::new(
        app.path_resolver()
            .resolve_resource(IVERILOG_EXE)
            .expect("Missing iverilog executable"),
    )
    .current_dir(output_directory)
    .args(files)
    .arg("-o")
    .arg(output_executable.clone())
    .output()?;

    tracing::info!(
        "iverilog exited with {:?}",
        compilation_output.status.code()
    );

    if compilation_output.status.success() {
        Ok(CompilationOutcome::Success {
            executable_path: output_executable,
        })
    } else {
        Ok(CompilationOutcome::Failure {
            errors: parse_compilation_output(&String::from_utf8_lossy(&compilation_output.stderr))?,
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
            Some(("file.vhd".to_owned(), Some(5), "syntax error".to_owned()))
        );
    }
    #[test]
    fn test_line_parsing_with_spaces() {
        assert_eq!(
            parse_compilation_output_line("file with spaces:1236: syntax error"),
            Some((
                "file with spaces".to_owned(),
                Some(1236),
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
                Some(1236),
                "we1rd 3rr*r".to_owned()
            ))
        );
    }
    #[test]
    fn test_line_parsing_with_message_type() {
        assert_eq!(
            parse_compilation_output_line("file.vhd:5: error: syntax error"),
            Some((
                "file.vhd".to_owned(),
                Some(5),
                "error: syntax error".to_owned()
            ))
        );
    }

    #[test]
    fn test_line_parsing_without_line_no() {
        assert_eq!(
            parse_compilation_output_line("file.vhd: syntax error"),
            Some(("file.vhd".to_owned(), None, "syntax error".to_owned()))
        );
    }
    #[test]
    fn test_line_parsing_with_spaces_without_line_no() {
        assert_eq!(
            parse_compilation_output_line("file with spaces: syntax error"),
            Some((
                "file with spaces".to_owned(),
                None,
                "syntax error".to_owned()
            ))
        );
    }
    #[test]
    fn test_line_parsing_weird_error_without_line_no() {
        assert_eq!(
            parse_compilation_output_line("file with spaces: we1rd 3rr*r"),
            Some((
                "file with spaces".to_owned(),
                None,
                "we1rd 3rr*r".to_owned()
            ))
        );
    }
    #[test]
    fn test_line_parsing_with_message_type_without_line_no() {
        assert_eq!(
            parse_compilation_output_line("file.vhd: error: syntax error"),
            Some((
                "file.vhd".to_owned(),
                None,
                "error: syntax error".to_owned()
            ))
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
                test:2.verilog: No such file
                test:2.verilog: Filename cannot contains colons
                I give up.
            "#,
        );

        assert!(res.is_ok(), "error: {:?}", res);
        let res = res.unwrap();
        assert_eq!(res.keys().len(), 2);
        assert!(res.contains_key("test:asdf  :3.verilog"));
        assert!(res.contains_key("test:2.verilog"));

        let f1 = res.get("test:asdf  :3.verilog").unwrap();
        assert!(f1.global.is_empty());
        assert_eq!(f1.lines.keys().len(), 4);
        assert!(f1.lines.contains_key(&1));
        assert!(f1.lines.contains_key(&4));
        assert!(f1.lines.contains_key(&6));
        assert!(f1.lines.contains_key(&13));

        let l1 = f1.lines.get(&1).unwrap();
        let l4 = f1.lines.get(&4).unwrap();
        let l6 = f1.lines.get(&6).unwrap();
        let l13 = f1.lines.get(&13).unwrap();

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

        let f2 = res.get("test:2.verilog").unwrap();
        assert_eq!(f2.global.len(), 2);
        assert_eq!(f2.lines.keys().len(), 0);

        assert!(f2.global.contains(&"No such file".to_owned()));
        assert!(f2
            .global
            .contains(&"Filename cannot contains colons".to_owned()));
    }
}