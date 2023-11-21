use std::ffi::OsStr;

use crate::error::Error;

pub fn to_utf8<O: AsRef<std::ffi::OsStr>>(path: &O) -> Result<String, Error> {
    if let Some(s) = path.as_ref().to_str() {
        Ok(s.to_owned())
    } else {
        Err(Error::Other(
            "Path should contain only UTF-8 characters".to_owned(),
        ))
    }
}

pub fn build_glob_matcher<S: AsRef<str>, I: Iterator<Item = S>>(
    it: I,
) -> Result<globset::GlobSet, Error> {
    use globset::{GlobBuilder, GlobSetBuilder};

    let mut builder = GlobSetBuilder::new();

    for pat in it {
        match GlobBuilder::new(pat.as_ref())
            .literal_separator(true)
            .build()
        {
            Ok(glob) => {
                builder.add(glob);
            }
            Err(e) => {
                tracing::error!("Invalid glob pattern \"{e:?}\"");
            }
        }
    }

    builder
        .build()
        .map_err(|e| Error::Other(format!("Could not build glob matcher: {e:?}")))
}

pub fn serialize_as_string<S: serde::Serializer, T: AsRef<OsStr>>(
    t: T,
    s: S,
) -> Result<S::Ok, S::Error> {
    s.serialize_str(&t.as_ref().to_string_lossy())
}
