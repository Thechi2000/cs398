use std::fmt::Debug;

use serde::{Serialize, Serializer};

fn error_to_string<E: Debug, S: Serializer>(e: E, s: S) -> Result<S::Ok, S::Error> {
    s.serialize_str(&format!("{:?}", e))
}

#[derive(Debug, Serialize)]
pub enum Error {
    Process(#[serde(serialize_with = "error_to_string")] tauri::api::Error),
    IO(#[serde(serialize_with = "error_to_string")] std::io::Error),
    Other(String),
    NoProject,
}

impl From<std::io::Error> for Error {
    fn from(value: std::io::Error) -> Self {
        Self::IO(value)
    }
}
impl From<tauri::api::Error> for Error {
    fn from(value: tauri::api::Error) -> Self {
        Self::Process(value)
    }
}
