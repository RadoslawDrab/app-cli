import chalk from 'chalk'
import * as fs from 'fs'
import * as path from 'path'

export function walk(p: string, callback: (path: string, fileInfo: fs.Stats, root: string) => void, options: {excludeDirs?: boolean, excludeFiles?: boolean, filter?: string | RegExp | string[] | RegExp[], recursive?: boolean} = {excludeDirs: false, excludeFiles: false, recursive: true}) {
    const entries = fs.readdirSync(p, {recursive: options.recursive}) as string[]
    for (const entry of entries) {
        const fileInfo = fs.statSync(`${p}/${entry}`)

        if (options.filter) {
            const filter = Array.isArray(options.filter) ? options.filter : [options.filter]
            if(!filter.some((f) => new RegExp(f).test(entry))) continue
        }
        else {
            if (options.excludeFiles && fileInfo.isFile()) continue
            if (options.excludeDirs && fileInfo.isDirectory()) continue
        }

        callback(entry, fileInfo, p)
    }
}

export function fileLines(path: string) {
    ensureFileSync(path)
    return fs.readFileSync(path).toString().replace(/\\r$/, '').split(/[\n\r]/).filter(l => l)
}

export function kebabCase(text: string) {
    return text.toLowerCase().replace(/\s/g, '-')
}

export function ensureFileSync(path: string) {
    if (!fs.existsSync(path)) fs.writeFileSync(path, '')
}
export function ensureDirSync(path: string) {
    if (!fs.existsSync(path)) fs.mkdirSync(path)
}

export function getFiles(p: string, name: string | RegExp) {
    const paths: string[] = []
    walk(p, (recursivePath) => {
        if(new RegExp(name).test(path.basename(recursivePath))) {
            paths.push(recursivePath)
        }
    }, { excludeDirs: true })
    return paths
}
export function log(type: 'success' | 'info' | 'error' | 'default', ...text: any[]) {
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