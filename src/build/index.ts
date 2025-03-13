import chalk from 'chalk'
import path from 'path'

import cleanup from 'build/cleanup'
import esbuild from 'build/esbuild'
import templates from 'build/templates'
import pack from 'build/package'

import { log as l } from '../utils'
export const log = l

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

try {
    cleanup(build)
    esbuild(build)
    templates(build)
    pack(build)
    log('success', 'App built successfully!')
} catch (e: any) {
    log('error', 'Error:', e)
}

