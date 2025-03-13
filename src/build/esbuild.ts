import * as esbuild from 'esbuild'
import fs from 'fs'
import path from 'path'
import { Build, log } from 'build'

export const ENV_VARIABLES = ['NODE_ENV', 'VERSION']

export default (build: Build) => {
    const env = process.env
    const packageFile = path.join(process.cwd(), 'package.json')
    if (fs.existsSync(packageFile)) env.VERSION = JSON.parse(fs.readFileSync(packageFile, 'utf8')).version

    const options: esbuild.BuildOptions = {
        entryPoints: ['./src/index.ts'],
        outfile: path.resolve(build.CURRENT_DIR, build.OUT_FILE),
        bundle: true,
        format: 'cjs',
        platform: 'node',
        treeShaking: true,
        target: 'esnext',
        minify: true,
        sourcemap: 'inline',
        define: Object.keys(env)
                      .filter(key => ENV_VARIABLES.includes(key))
                      .reduce((obj, key) => ({ ...obj, ['process.env.' +  key]: `"${env[key]}"`}), {})
    }

    log('default', 'Started building...')
    esbuild.buildSync(options)
    log('info', 'Package built')
}
