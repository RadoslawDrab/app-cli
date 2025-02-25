import * as fs from 'fs'
import * as path from 'path'

export async function walk(p: string, callback: (path: string, fileInfo: fs.Stats) => void) {
    const fileInfo = fs.statSync(p)
    callback(p, fileInfo)
    if (fileInfo.isDirectory()) {
        const entries = fs.readdirSync(p, {recursive: true}) as string[]
        for (const entry of entries) {
            await walk(`${p}/${path.basename(entry)}`, callback)
        }
    }
}

export function fileLines(path: string) {
    ensureFileSync(path)

    return fs.readFileSync(path).toString().split('\n')
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