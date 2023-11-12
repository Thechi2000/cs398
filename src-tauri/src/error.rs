#[derive(Debug)]
pub enum Error {
    Process(tauri::api::Error),
    IO(std::io::Error),
    Other(String),
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
