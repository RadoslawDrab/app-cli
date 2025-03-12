import path from 'path'
import shell from 'shelljs'
import { ensureDirSync, fileLines, getFiles, walk } from '../utils'

import { Build, log } from 'build'

export default (build: Build) => {
    try {
        const filters: RegExp[] = []
        ensureDirSync(build.TEMPLATES_OUT_DIR)
        walk('templates', (p, _, root) => filters.push(...fileLines(`${root}/${p}`).map(p => new RegExp(p))),
            { recursive: false, filter: '.skip', excludeDirs: true }
        )

        walk('templates', (directory, _, root) => {
            const files = getFiles(`${root}/${directory}`, '.skip')
            walk(`${root}/${directory}`, (p, _, root) => {
                filters.push(...fileLines(`${root}/${p}`).map((d) => new RegExp(d)))
            }, { filter: files })
        }, {excludeFiles: true})

        log('default', 'Started copying templates...')
        walk('templates', (p, info, root) => {
            if (!filters.some(f => f.test(p.replaceAll('\\', '/')))) {
                info.isFile() ?
                    shell.cp('-f', path.join(root, p), path.join(build.TEMPLATES_OUT_DIR, p))
                    :
                    shell.mkdir('-p', path.join(build.TEMPLATES_OUT_DIR, p))
            }
        })
        log('info', 'Copied templates')
    } catch (e: any) {
        log('error', 'Error:', e)
    }
}
