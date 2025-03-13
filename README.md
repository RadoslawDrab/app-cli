# 🚀 template-app-cli: A Simple Project Generator

## Overview ✨📌📝
`template-app-cli` is a powerful yet easy-to-use command-line tool that allows users to generate projects from predefined templates, including web applications, backend services, and static sites. It provides an interactive experience where users can select a template and specify project details such as name, version, and author. 🎯📂✅

## Installation 📥💻⚙️
To install `template-app-cli`, use npm:

```sh
npm install -g template-app-cli
```

## Getting Started 🖥️🔧📜

### Running the CLI 🏃📂🖱️
To start `template-app-cli`, navigate to your desired folder and run:

```sh
template-app-cli
```

This will launch an interactive prompt where you can configure your project. 🏗️✅💡

### Interactive Process 🎛️📜🎯
1. **Select a Template**: Browse through the available templates using the arrow keys and choose one that fits your needs.
2. **Enter Project Details**:
    - **Project Name**: Provide a name for your project.
    - **Version**: Specify the project version (default: `0.0.1`).
    - **Author**: Enter your name or the name of the project owner.
3. **Project Creation**: Once the details are entered, `template-app-cli` will generate the project in the current directory and apply the specified configurations. 📂✅✨

### Example 🎨📜⚡
```sh
$ template-app-cli
? Select a template: (Use arrow keys)
  template-1
  template-2
> template-3

? Enter project name: my-project
? Enter version: 0.0.1
? Enter author: John Doe

✔ Project "my-project" created successfully!
```

## Features 🔥🛠️📌
✅ User-friendly interactive CLI  
✅ Supports multiple templates  
✅ Customizable project metadata  
✅ Quick and efficient project setup

## Arguments ⚙️📌🖥️

### Help & Version
- `--help, -h` → Display help message
- `--version, -v` → Show app version

### Configuration Options
- `--config, -c PATH` → Config file path. Needs to be used everytime you want to use other config file (default: `<SCRIPT_PATH>`)
- `--dir, -d PATH` → Templates directory path (default: `<SCRIPT_PATH>/templates`)
- `--skip, -s NAME` → Skip file name (default: `skip`)

### Project Defaults
- `--author NAME` → Set default project author (default: `null`)
- `--app-version VERSION` → Set default project version (default: `0.0.1`)

## Contributing 🤝📬🚀
Contributions are welcome! If you have ideas for improvements or bug fixes, feel free to submit issues or pull requests on the [GitHub repository](#https://github.com/RadoslawDrab/app-cli). 🌍🛠️❤️

## License 📜⚖️✅
`template-app-cli` is licensed under the MIT License. 🎯📄🆓

