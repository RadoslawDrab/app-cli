import chalk from 'chalk'
import path from 'path'

import cleanup from 'build/cleanup'
import esbuild from 'build/esbuild'
import templates from 'build/templates'
import pack from 'build/package'

export interface Build {
    CURRENT_DIR: string
    OUT_DIR: string
    OUT_FILE: string
    TEMPLATES_OUT_DIR: string
}

const CURRENT_DIR = process.cwd()
const OUT_DIR = path.join(CURRENT_DIR, 'dist')
const OUT_FILE = path.join(OUT_DIR, 'index.cjs')
const TEMPLATES_OUT_DIR = path.join(OUT_DIR, 'templates')

const build: Build = {
    CURRENT_DIR,
    OUT_DIR,
    OUT_FILE,
    TEMPLATES_OUT_DIR
}

cleanup(build)
esbuild(build)
templates(build)
pack(build)

log('success', 'App built successfully!')

export function log(type: 'success' | 'info' | 'error' | 'default', ...text: string[]) {
    console.log(...text.map((t) => {
        switch (type) {
            case 'info':
                return chalk.blue(t)
            case 'success':
                return chalk.green(t)
            case 'error':
                return chalk.red(t)
            default:
                return chalk.dim(t)
        }
    }))
}