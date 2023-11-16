/*
Project state
 */

use std::{
    fs::{self, DirEntry},
    path::PathBuf,
};

use serde::Serialize;

use crate::{error::Error, state::State, util::to_utf8};

pub struct Project {
    /// Project name
    pub name: String,
    /// Directory to compile
    pub project_directory: String,
    /// Files to not compile
    pub excluded_files: Vec<String>, //TODO
}

#[derive(Debug, Serialize)]
pub struct Directory {
    /// Absolute Path to the directory
    pub path: String,
    /// File Name
    pub name: String,
    /// Empty : the directory is a file / Non-empty : Files and directories embeded in it
    pub children: Vec<Directory>,
}

#[tauri::command]
pub async fn read_project_tree(state: tauri::State<'_, State>) -> Result<Directory, Error> {
    if let Some(project) = state.project() {
        project.read_project_tree()
    } else {
        Err(Error::NoProject)
    }
}

impl Project {
    pub fn from_current_dir() -> Result<Self, Error> {
        Ok(Self::from_dir(to_utf8(&std::env::current_dir()?)?))
    }

    pub fn from_dir(path: String) -> Self {
        Project {
            name: PathBuf::from(&path)
                .file_name()
                .unwrap()
                .to_string_lossy()
                .to_string(),
            project_directory: path,
            excluded_files: vec![],
        }
    }

    pub fn read_project_tree(&self) -> Result<Directory, Error> {
        fn recursive_read_dir<I: Iterator<Item = Result<DirEntry, std::io::Error>>>(
            it: I,
        ) -> Result<Vec<Directory>, Error> {
            let mut project_tree = vec![];
            for entry in it {
                let entry = entry?;
                project_tree.push(Directory {
                    path: to_utf8(&entry.path())?,
                    name: to_utf8(&entry.file_name())?,
                    children: if entry.file_type()?.is_dir() {
                        recursive_read_dir(fs::read_dir(entry.path())?)?
                    } else {
                        vec![]
                    },
                })
            }
            Ok(project_tree)
        }

        Ok(Directory {
            path: to_utf8(&self.project_directory)?,
            name: to_utf8(&self.name)?,
            children: recursive_read_dir(fs::read_dir(&self.project_directory)?)?,
        })
    }

    pub fn output_directory(&self) -> PathBuf {
        PathBuf::from(&self.project_directory).join("out/")
    }
}
