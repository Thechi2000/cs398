if [ $(basename $PWD) = "src-tauri" ]
then
    cd ..
fi

ROOT=$PWD
cd iverilog

sh autoconf.sh
sh configure --prefix=$ROOT/iverilog-build
make install
