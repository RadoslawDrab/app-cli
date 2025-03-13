import { Build, log } from 'build'
import fs from 'fs'

export default (build: Build) => {
    log('default', 'Cleanup started')
    fs.rmSync(build.OUT_DIR, { recursive: true, force: true })
    log('info', 'Cleanup completed')
}