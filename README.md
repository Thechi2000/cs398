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
