import fs from 'fs'
import path from 'path'
import { Build, log } from 'build'

export default (build: Build) => {
    const scriptName = path.basename(build.CURRENT_DIR)

    const packageContent = JSON.parse(fs.readFileSync(path.join(build.CURRENT_DIR, 'package.json')).toString())

    packageContent.bin = {
        ...(packageContent.bin ?? {}),
        [scriptName]: path.relative(process.cwd(), build.OUT_FILE),
    }
    packageContent.name = scriptName

    fs.writeFileSync(path.join(build.CURRENT_DIR, 'package.json'), JSON.stringify(packageContent, null, 2))
    log('info', 'package.json modified')
}
