# CS398

## Abstract

The goal of this project is to create a cross-platform and easy to use IDE for Verilog.

## Main goals

Users should be able to simulate a Verilog project, test it through testbenches, and so on. They would visualize the signal waves in a similar way than [GTKWave](https://gtkwave.sourceforge.net/).

There would be a code editor integrated in the application to allow users to edit Verilog files.

The application will be easy to install and update on popular platforms (like Windows, MacOS or Ubuntu).

## Side goals

The code editor could include code highlighting and completion.

The GUI could feature a panel to use a VCS, like git.

The executable could be used as a CLI tool to ease automation.

## Technical approach

We will use the [Tauri](https://tauri.app/) framework to build the application, to combine [React](https://react.dev) for the UI and [Rust](https://rust-lang.org) for the logic and portability. It also has builtin tools for installation and updates.

For Verilog parsing and simulation, we will embed the [Icarus Project](https://github.com/steveicarus/iverilog) in our application. This will be eased by the use of Rust, as it has tools to integrate other compiled languages.

For the code editor, we will use the VSCode editor, as it is written in Javascript and is thus easy to add to the UI.

# Build

The following instructions are for cross-compilation from Linux to the given OS, since `iverilog` (and dependencies) can only be built on Linux.

- **TODO**: Build `iverilog` (etc...) for Windows
- **TODO**: Embed `iverilog` (etc...) in the resulting application
- **TODO**: Setup MacOSX build
- **TODO**: Setup automatic build through Github CI ?

## Linux

The following command will produce an AppImage and a deb package under `src-tauri/target/release/bundle`

```sh
npm run tauri build
```

## Windows

### Required packages

You need to install `lld`, `llvm` and `nsis` packages. The latter may need extra steps, since many distributions do not provided it as a package. More info in [Tauri Documentation](https://tauri.app/v1/guides/building/cross-platform#experimental-build-windows-apps-on-linux-and-macos).

### Rust target

Add the rust target using:

```sh
rustup target add x86_64-pc-windows-msvc
```

### Windows SDKs

The Windows SDKs are available through the [xwin](https://github.com/Jake-Shadle/xwin) project (change `<XWIN_INSTALL_DIR>` to whatever you want, for example `~/.xwin`):

```sh
cargo install xwin
xwin splat --output "<XWIN_INSTALL_DIR>" # If you get symlinks errors, add --disable-symlinks
```

Add the following lines to your `~/.cargo/config.toml`:

```toml
[target.x86_64-pc-windows-msvc]
linker = "lld"
rustflags = [
  "-Lnative=<XWIN_INSTALL_DIR>/crt/lib/x86_64",
  "-Lnative=<XWIN_INSTALL_DIR>/sdk/lib/um/x86_64",
  "-Lnative=<XWIN_INSTALL_DIR>/sdk/lib/ucrt/x86_64"
]
```

Once this setup is completed, you can build for a windows installer using:

```sh
npm run tauri build -- --target x86_64-pc-windows-msvc
```

The executable will be found in `src-tauri/target/x86_64-pc-windows-msvc/release/bundle/nsis/`
