# All the compilation must be done on a x86/x64 Linux machine

# Path to the directory in which the binaries will be put,
# relative to the iverilog/ directory
OUTPUT_LOCATION=../binaries

# Target name of all the platforms for which the app is build
# See https://tauri.app/v1/guides/building/sidecar/
LINUX_TARGET=x86_64-unknown-linux-gnu
WINDOWS_TARGET=x86_64-pc-windows-msvc

targets=$@

mkdir -p $OUTPUT_LOCATION

# ====================================================

# Ensures we are in the iverilog/ directory
if [ $(basename $PWD) = "src-tauri" ]; then
    cd ..
fi

ROOT=$PWD
cd iverilog

# ====================================================

# Build for Linux
if [[ ${targets[@]} =~ "linux" ]]; then
    make clean
    sh autoconf.sh
    sh configure --prefix=$ROOT/build/linux
    make install

    mv driver/iverilog $OUTPUT_LOCATION/iverilog-$LINUX_TARGET
    mv vvp/vvp $OUTPUT_LOCATION/vvp-$LINUX_TARGET
fi

# ====================================================

# Build for Windows
# Requires cross-compilation packages:
#   On Arch: sudo pacman -S mingw-w64-gcc
if [[ ${targets[@]} =~ "windows" ]]; then
    make clean
    sh autoconf.sh
    sh configure --host=x86_64-w64-mingw32 --prefix=$ROOT/build/windows
    make install

    mv driver/iverilog.exe $OUTPUT_LOCATION/iverilog-$WINDOWS_TARGET.exe
    mv vvp/vvp.exe $OUTPUT_LOCATION/vvp-$WINDOWS_TARGET.exe
fi
