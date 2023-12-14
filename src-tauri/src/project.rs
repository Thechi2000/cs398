/*
Project state
 */

use std::{
    ffi::{OsStr, OsString},
    fs::{self, DirEntry},
    path::PathBuf,
};

use globset::GlobSet;
use lazy_static::lazy_static;
use regex::Regex;
use serde::Serialize;

use crate::{error::Error, state::State, util::build_glob_matcher};

lazy_static! {
    static ref HIDDEN_FILES: Regex = Regex::new("out(/.*)?").unwrap();
}

pub struct Project {
    /// Project name
    pub name: String,
    /// Directory to compile
    pub project_directory: PathBuf,
    /// Files/Patterns to include in compilation
    pub included_files: Vec<String>,
    /// Files/Patterns to exclude from compilation
    pub excluded_files: Vec<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ProjectEntry {
    /// Absolute Path to the directory
    #[serde(serialize_with = "crate::util::serialize_as_string")]
    pub path: PathBuf,
    /// File Name
    #[serde(serialize_with = "crate::util::serialize_as_string")]
    pub name: OsString,
    pub children: Vec<ProjectEntry>,
    pub is_dir: bool,
}

#[tauri::command]
pub async fn read_project_tree(state: tauri::State<'_, State>) -> Result<ProjectEntry, Error> {
    if let Some(project) = state.project() {
        project.read_project_tree(false)
    } else {
        Err(Error::NoProject)
    }
}

impl Project {
    pub fn from_current_dir() -> Result<Self, Error> {
        Ok(Self::from_dir(std::env::current_dir()?))
    }

    pub fn from_dir(path: PathBuf) -> Self {
        Project {
            name: PathBuf::from(&path)
                .file_name()
                .unwrap()
                .to_string_lossy()
                .to_string(),
            project_directory: path,
            excluded_files: vec![],
            included_files: vec!["**/*.v".to_owned(), "**/*.verilog".to_owned()],
        }
    }

    pub fn read_project_tree(&self, apply_filters: bool) -> Result<ProjectEntry, Error> {
        let include_matcher = build_glob_matcher(self.included_files.iter())?;
        let exlude_matcher = build_glob_matcher(self.excluded_files.iter())?;

        fn recursive_read_dir<I: Iterator<Item = Result<DirEntry, std::io::Error>>>(
            it: I,
            base: &PathBuf,
            include_matcher: Option<&GlobSet>,
            exlude_matcher: Option<&GlobSet>,
        ) -> Result<Vec<ProjectEntry>, Error> {
            let mut project_tree = vec![];
            for entry in it {
                let entry = entry?;
                let path = entry.path();
                let stripped_path = path.strip_prefix(base).map_err(|e| {
                    Error::Other(format!(
                        "Could not strip base prefix for {} (base: {}): {e:?}",
                        entry.path().display(),
                        base.display()
                    ))
                })?;

                if (path.is_dir()
                    || include_matcher.is_none()
                    || include_matcher.unwrap().is_match(stripped_path))
                    && (exlude_matcher.is_none() || exlude_matcher.unwrap().is_match(stripped_path))
                    && !HIDDEN_FILES.is_match(&stripped_path.as_os_str().to_string_lossy())
                {
                    project_tree.push(ProjectEntry {
                        is_dir: path.is_dir(),
                        path,
                        name: entry.file_name(),
                        children: if entry.file_type()?.is_dir() {
                            recursive_read_dir(
                                fs::read_dir(entry.path())?,
                                base,
                                include_matcher,
                                exlude_matcher,
                            )?
                        } else {
                            vec![]
                        },
                    })
                }
            }
            Ok(project_tree)
        }

        Ok(ProjectEntry {
            path: self.project_directory.clone(),
            name: self
                .project_directory
                .file_name()
                .unwrap_or_else(|| OsStr::new(".."))
                .to_os_string(),
            children: recursive_read_dir(
                fs::read_dir(&self.project_directory)?,
                &self.project_directory,
                apply_filters.then_some(&include_matcher),
                apply_filters.then_some(&exlude_matcher),
            )?,
            is_dir: true,
        })
    }

    pub fn output_directory(&self) -> Result<PathBuf, Error> {
        let path = PathBuf::from(&self.project_directory).join("out/");
        if !path.is_dir() {
            fs::create_dir(path.clone())?
        }
        Ok(path)
    }
}
