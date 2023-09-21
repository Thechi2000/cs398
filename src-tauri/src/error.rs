#[derive(Debug)]
pub enum Error {
    IO(std::io::Error),
    Other(String)
}

impl From<std::io::Error> for Error {
    fn from(value: std::io::Error) -> Self {
        Self::IO(value)
    }
}
