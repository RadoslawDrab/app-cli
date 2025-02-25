#!/usr/bin/env node

import * as path from 'path'
import * as fs from 'fs'
import inquirer from 'inquirer'
import chalk from 'chalk'

// @ts-expect-error Valid types
import type { QuestionCollection, ListChoiceOptions } from 'inquirer'

import { ensureDirSync, fileLines, kebabCase } from './utils.ts'

const TEMPLATES_PATH = path.join(process.cwd(), 'templates')
const SKIP_PATH = path.join(TEMPLATES_PATH, '.skip')

const CHOICES = Array.from(fs.readdirSync(TEMPLATES_PATH) as string[])
                     .filter(entry => fs.statSync(path.join(TEMPLATES_PATH, entry)).isDirectory())
                     .map((entry) => path.basename(entry))
                     .map<ListChoiceOptions>(name => ({
                         name: name.match(/(?<=\[).+(?=])/)?.at(0) ?? name,
                         value: name
                     }))

const SKIP_FILES: RegExp[] = [/.skip/, ...fileLines(SKIP_PATH).map(value => new RegExp(value))]
const QUESTIONS: QuestionCollection = [
    {
        name: 'template',
        type: 'list',
        message: 'What template would you like to use?',
        choices: CHOICES
    },
    {
        name: 'name',
        type: 'input',
        message: 'Project name:',
        validate: (answer: string) => {
            if (answer.length < 3) return 'Name should contain at least 3 characters'
            if (fs.existsSync(path.join(process.cwd(), kebabCase(answer)))) return 'Directory already exists'
            return true
        }
    }
]

inquirer.prompt(QUESTIONS)
        .then(answers => {
            const template: string = answers.template
            const name: string = answers.name
            const targetPath = path.join(process.cwd(), kebabCase(name))
            const templatePath = path.join(TEMPLATES_PATH, template)
            const templateSkipPath = path.join(TEMPLATES_PATH, template, '.skip')

            ensureDirSync(templatePath)
            ensureDirSync(targetPath)
            ensureDirSync(templateSkipPath)

            const skippedFiles = [...SKIP_FILES, ...fileLines(templateSkipPath).map(value => new RegExp(value))]

            const all = (fs.readdirSync(templatePath, { recursive: true }) as string[])
            .filter(entry => !skippedFiles.some(f => f.test(entry)))
            .map((e) =>path.join(templatePath, e))

            const directories = all.filter(file => fs.statSync(file).isDirectory())
            const files = all.filter(file => fs.statSync(file).isFile())

            const getRelative = (p: string, isDirectory: boolean = false) => path.join(targetPath, path.relative(templatePath, isDirectory ? p : path.dirname(p)))
            // Creates all directories needed
            for (const directory of directories) {
                const path = getRelative(directory, true)
                ensureDirSync(path)
            }

            for (const file of files) {
                const resolved = getRelative(file)
                // Copies file content to new files
                fs.writeFileSync(path.join(resolved, path.basename(file)), fs.readFileSync(file, 'utf-8'))
            }
            console.clear()
            console.log(chalk.green.bold(`Created app`))
            console.log(chalk.blue(`cd ${name}\nnpm install\nnpm run dev`))
        })
        .catch(err => {
            console.error(chalk.red(err))
            return
        })