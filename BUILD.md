# Guide on how to build the add-on

This is an incomplete guide to help you build the native node add-on.
The C++ code supports nodejs version 4.0.0 to 8.0.0.

On all platforms, the only supported shell is `bash`.

## Requirements
### macOS

    - Latest XCode with command line tools
    - libtool `brew install libtool`
    - cmake `brew install cmake`
    - autoconf `brew install autoconf`
    - automake `brew install automake`
    - python 2.7 (should already be on your mac)
    - nasm `brew install nasm`
    - node-gyp `npm -g i node-gyp`
    - wget `brew install wget`

### Linux

    - gcc `sudo apt-get install gcc`
    - g++ `sudo apt-get install g++`
    - pkg-config `sudo apt-get install pkg-config`
    - libtool `sudo apt-get install libtool`
    - cmake `sudo apt-get install cmake`
    - autoconf `sudo apt-get install autoconf`
    - python 2.7 `sudo apt-get install python-minimal`
    - nasm `sudo apt-get install nasm`
    - node-gyp `npm -g i node-gyp`
    - wget `brew install wget`

### Windows (usign gitbash or cygwin)

    - Visual Studio 2015 with C++
    - cmake
    - autoconf
    - python 2.7
    - wget
    - node-gyp `npm -g i node-gyp`

## Building source

### 1. Download and prepare third-party code

`npm run third-party`

### 2. Build for the current node version

`npm run rebuild`

The compiled binding file will be at `./build/Release/binding.node`

### 3. Run the tests

`npm test`

> All good!

## Build for specific node version

```sh
node-gyp configure --release --target=vX.Y.Z --silent
node-gyp build --release --silent -j 4
```

For a debug build, replace `--release` with `--debug` and
run your app with with:

`node app.js --images-build-path build/Debug/binding.node`
