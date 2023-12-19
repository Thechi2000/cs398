#[cfg(target_os = "linux")]
mod inner {
    pub const IVERILOG_EXE: &str = "../binaries/x86_64-unknown-linux/bin/iverilog";
    pub const VVP_EXE: &str = "../binaries/x86_64-unknown-linux/bin/vvp";
}

#[cfg(target_os = "windows")]
mod inner {
    pub const IVERILOG_EXE: &str = "../binaries/x86_64-pc-windows/bin/iverilog.exe";
    pub const VVP_EXE: &str = "../binaries/x86_64-pc-windows/bin/vvp.exe";
}

#[cfg(all(target_os = "darwin", target_arch = "aarch64"))]
mod inner {
    pub const IVERILOG_EXE: &str = "../binaries/aarch64-apple-darwin/bin/iverilog";
    pub const VVP_EXE: &str = "../binaries/aarch64-apple-darwin/bin/vvp";
}

#[cfg(all(target_os = "darwin", target_arch = "x86_64"))]
mod inner {
    pub const IVERILOG_EXE: &str = "../binaries/x86_64-apple-darwin/bin/iverilog";
    pub const VVP_EXE: &str = "../binaries/x86_64-apple-darwin/bin/vvp";
}

// The use of a submodule allows to put all the os-dependent variables behind a single `#[cfg]` attribute.
pub use inner::*;
