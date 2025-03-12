import { Build, log } from 'build'
import fs from 'fs'

export default (build: Build) => {
    try {
        log('default', 'Cleanup started')
        fs.rmSync(build.OUT_DIR, { recursive: true, force: true })
        log('info', 'Cleanup completed')
    } catch (e: any) {
        log('error', 'Error:', e)
    }
}