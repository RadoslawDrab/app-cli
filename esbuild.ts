#!/usr/bin/env node

import * as esbuild from 'esbuild'
import * as fs from 'fs'
import * as path from 'path'
import chalk from 'chalk'

const CURRENT_DIR = process.cwd()
const OUT_FILE = path.join('dist', 'index.cjs')

const options: esbuild.BuildOptions = {
    plugins: [],
    entryPoints: ['./src/index.ts'],
    outfile: path.resolve(CURRENT_DIR, OUT_FILE),
    bundle: true,
    format: 'cjs',
    platform: 'node',
    treeShaking: true,
    target: 'esnext',
}

esbuild.buildSync(options)

esbuild.stop()


const scriptName = path.basename(CURRENT_DIR)

const packageContent = JSON.parse(fs.readFileSync(path.join(CURRENT_DIR, 'package.json')).toString())

packageContent.bin = {
    ...(packageContent.bin ?? {}),
    [scriptName]: OUT_FILE,
}
packageContent.name = scriptName

fs.writeFileSync(path.join(CURRENT_DIR, 'package.json'), JSON.stringify(packageContent, null, 2))

console.log(chalk.green('App built successfully.'))

