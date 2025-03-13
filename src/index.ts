#!/usr/bin/env node

import * as path from 'path'
import * as fs from 'fs'
import inquirer from 'inquirer'
import chalk from 'chalk'

import { render } from 'templates'
import { ensureDirSync, ensureFileSync, fileLines, kebabCase, log } from 'utils'
import Config from 'config'

// @ts-expect-error Valid types
import type { QuestionCollection, ListChoiceOptions } from 'inquirer'


init(new Config())

function init(config: Config) {
    config.replaceMods([
        { name: 'dir', default: config.data.dir },
        { name: 'defaultVersion', default: config.data.defaultVersion, },
        { name: 'defaultAuthor', default: config.data.defaultAuthor, },
        { name: 'skipFileName', default: config.data.skipFileName }
    ])

    if(Config.args().help) {
        console.clear()
        console.log(Config.helpText(config.mods))
        return
    }
    if (Config.args(true, config.mods).version) {
        log('info', Config.currentVersion())
        return
    }
    if (Config.hasArgs()) return log('success', 'Config updated')



    const TEMPLATES_PATH = config.data.dir
    const SKIP_FILE_NAME = config.data.skipFileName
    const SKIP_PATH = path.join(TEMPLATES_PATH, SKIP_FILE_NAME)

    if (!fs.existsSync(TEMPLATES_PATH)) {
        log('error', `Templates path '${TEMPLATES_PATH}' does not exist`)
        return
    }

    // Shows only directories with formatted value
    const CHOICES = Array.from(fs.readdirSync(TEMPLATES_PATH) as string[])
                         .filter(entry => fs.statSync(path.join(TEMPLATES_PATH, entry)).isDirectory())
                         .map((entry) => path.basename(entry))
                         .map<ListChoiceOptions>(name => ({
                             name: name.match(/(?<=\[).+(?=])/)?.at(0) ?? name,
                             value: name
                         }))

    const SKIP_FILES: RegExp[] = [new RegExp(SKIP_FILE_NAME), ...fileLines(SKIP_PATH).map(value => new RegExp(value))]
    const QUESTIONS: QuestionCollection = [
        {
            name: 'template',
            type: 'list',
            message: 'Select a template:',
            choices: CHOICES
        },
        {
            name: 'name',
            type: 'input',
            message: 'Enter project name:',
            validate: (answer: string) => {
                if (answer.length < 3) return 'Name should contain at least 3 characters'
                if (fs.existsSync(path.join(process.cwd(), kebabCase(answer)))) return 'Directory already exists'
                return true
            }
        },
        {
            name: 'version',
            type: 'input',
            message: 'Enter version:',
            validate: (answer: string) => {
                if (!/^\d+\.\d+\.\d+$/.test(answer)) return 'Semantic version must be valid'
                return true
            },
            default: config.data.defaultVersion
        },
        {
            name: 'author',
            type: 'input',
            message: 'Enter author:',
            default: config.data.defaultAuthor
        }
    ]

    inquirer.prompt(QUESTIONS)
            .then(answers => {
                const template: string = answers.template
                const name: string = answers.name
                const targetPath = path.join(process.cwd(), kebabCase(name))
                const templatePath = path.join(TEMPLATES_PATH, template)
                const templateSkipPath = path.join(TEMPLATES_PATH, template, SKIP_FILE_NAME)

                ensureDirSync(templatePath)
                ensureDirSync(targetPath)
                ensureFileSync(templateSkipPath)

                // Gets RegEx of files to skip
                const skippedFiles = [...SKIP_FILES, ...fileLines(templateSkipPath).map(value => new RegExp(value))]

                // Gets all filtered files and directories
                const all = (fs.readdirSync(templatePath, { recursive: true }) as string[])
                    .filter(entry => !skippedFiles.some(f => f.test(entry)))
                    .map((e) => path.join(templatePath, e))

                const directories = all.filter(file => fs.statSync(file).isDirectory())
                const files = all.filter(file => fs.statSync(file).isFile())

                // Gets relative path
                const getRelative = (p: string, isDirectory: boolean = false) =>
                    path.join(targetPath, path.relative(templatePath, isDirectory ? p : path.dirname(p)))

                // Creates all directories needed
                for (const directory of directories) {
                    const path = getRelative(directory, true)
                    ensureDirSync(path)
                }

                for (const file of files) {
                    const resolved = getRelative(file)
                    // Copies file content to new files
                    fs.writeFileSync(path.join(resolved, path.basename(file)), render(fs.readFileSync(file, 'utf-8'),
                        {
                            projectName: name,
                            author: answers.author,
                            version: answers.version
                        }
                    ))
                }
                console.clear()
                console.log(chalk.green.bold(`✔ Project "${name}" created successfully!`))
                console.log(chalk.italic.bgGray.whiteBright(`cd ${name}\nnpm install\nnpm run dev`))
            })
            .catch(err => {
                console.error(chalk.red(err))
                return
            })
}
