/*
Project state
 */

use std::{ffi::OsString, path::PathBuf};

pub struct Project {
    /// Project name
    pub name: String,
    /// Directory to compile
    pub project_directory: OsString,
    /// Files to not compile
    pub excluded_files: Vec<OsString>,
}

impl Project {
    pub fn from_current_dir() -> Result<Self, std::io::Error> {
        Ok(Self::from_dir(std::env::current_dir()?))
    }

    pub fn from_dir(path: PathBuf) -> Self {
        Project {
            name: path.file_name().unwrap().to_string_lossy().to_string(),
            project_directory: path.into_os_string(),
            excluded_files: vec![],
        }
    }
}
