use std::ffi::OsStr;

use crate::error::Error;

pub fn to_utf8<O: AsRef<OsStr>>(path: &O) -> Result<String, Error> {
    if let Some(s) = path.as_ref().to_str() {
        Ok(s.to_owned())
    } else {
        Err(Error::Other(
            "Path should contain only UTF-8 characters".to_owned(),
        ))
    }
}
