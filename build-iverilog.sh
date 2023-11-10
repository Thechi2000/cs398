# All the compilation must be done on a x86/x64 Linux machine

# ====================================================

# Ensures we are in the iverilog/ directory
if [ $(basename $PWD) = "src-tauri" ]; then
    cd ..
fi

# Root of the repository
ROOT=$PWD
cd iverilog

# ====================================================

# Build for x86 systems
sh autoconf.sh
sh configure --prefix=$ROOT/iverilog-build-x86
make install

# ====================================================

# Build for Windows
# Requires cross-compilation packages:
#   On Arch: sudo pacman -S mingw-w64-gcc
make clean
sh autoconf.sh
sh configure --host=x86_64-w64-mingw32
make

mkdir iverilog-build-windows
cp iverilog/version.exe \
    iverilog/ivlpp/ivlpp.exe \
    iverilog/vhdlpp/vhdlpp.exe \
    iverilog/driver-vpi/iverilog-vpi.exe \
    iverilog/driver/iverilog.exe \
    iverilog/ivl.exe \
    iverilog/vvp/vvp.exe \
    iverilog-build-windows/
