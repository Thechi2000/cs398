ROOT=$PWD
cd iverilog

sh autoconf.sh
sh configure --prefix=$ROOT/iverilog-build
make install
