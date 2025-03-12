import * as esbuild from 'esbuild'
import path from 'path'
import { Build, log } from 'build'

export default (build: Build) => {
    try {
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
        }

        log('default', 'Started building...')
        esbuild.buildSync(options)
        log('info', 'Package built')
    } catch (e: any) {
        log('error', 'Error:', e)
    }
}
