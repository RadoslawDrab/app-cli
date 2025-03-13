import chalk from 'chalk'
import fs from 'fs'
import minimist from 'minimist'
import path from 'path'

export default class Config {
    data: ConfigData = defaultData
    configPath: string = Config.args().configPath
    mods: ModHelpOption[] = []
    private readonly _filePath: string
    constructor() {
        this._filePath = path.join(this.configPath, 'config.json')

        // Creates file if it doesn't exist
        if (!fs.existsSync(this._filePath)) {
            this.updateFile()
            return
        }

        const data = JSON.parse(fs.readFileSync(this._filePath, 'utf8'))
        // Retrieves data from json file
        this.data = Config.compareData<ConfigData>(data, defaultData)
                          .reduce((obj, [key, value]) => ({...obj, [key]: value}), Object.create(defaultData))

        // Updates data if any args are present
        if (Config.hasArgs()) {
            const args = Config.args(false)
            Config.compareData(args, this.data)
                  .map(([key, value]) => {
                      this.update(key, value)
                  })
        }


    }
    replaceMods(mods: ModHelpOption[]) {
        this.mods = mods
    }
    /** Updates local data and config file for specific key */
    update(key: keyof typeof this.data, value: any): Config {
        this.data[key] = value
        this.updateFile()
        return this
    }
    /** Updates config file */
    updateFile() {
        const dir = path.parse(this._filePath).dir
        if(!fs.existsSync(dir))
            fs.mkdirSync(path.parse(this._filePath).dir, { recursive: true })
        fs.writeFileSync(this._filePath, JSON.stringify(this.data, null, 2))
    }
    /**
     * Outputs object which contains only keys present in template object and which values are defined
     * @param obj {object} Object which will be compared
     * @param templateObject {object} Object to compare to
     * @returns {[string, any][]} Returns array of [key, value]
     * */
    private static compareData<T1 extends Record<string, any>, T2 extends Record<string, any> = T1>(obj: T1, templateObject: T2): [keyof T2, T2[keyof T2]][] {
        return (Object.keys(obj)
                      // Filters keys which are in `templateObject`
                      .filter((key) => Object.keys(templateObject).includes(key)) as (keyof typeof templateObject)[])
                      // @ts-expect-error Is correct key of `obj`
                      // Filters values which are defined
                      .filter(key => obj[key] !== undefined)
                      // @ts-expect-error Is correct key of `obj`
                      .map((key) => [key, obj[key]])
    }

    /**
     * Retrieves help options
     * @param mods {ModHelpOption[]} Mods which will replace predefined values
     * */
    private static _helpOptions(mods: ModHelpOption[] = []): (HelpOption | 'SEPARATOR')[] {
        const cwd = Config.isProduction() ? __dirname : process.cwd()
        const options: (HelpOption | 'SEPARATOR')[] = [
            { name: 'help', args: ['help', 'h'], description: 'Display help message' },
            { name: 'version', args: ['version', 'v'], description: 'Show app version'},
            'SEPARATOR',
            { name: 'configPath', args: ['config', 'c'], value: 'PATH', description: 'Config file path', default: Config.isProduction() ? cwd : path.join(cwd, 'node_modules', '.temp') },
            { name: 'dir', args: ['dir', 'd'], value: 'PATH', description: 'Templates directory path', default: path.join(cwd, 'templates') },
            { name: 'skipFileName', args: ['skip', 's'], value: 'NAME', description: 'Skip file name', default: 'skip' },
            'SEPARATOR',
            { name: 'defaultAuthor', args: ['author'], value: 'NAME', description: 'Set default project author', default: null },
            { name: 'defaultVersion', args: ['app-version'], value: 'VERSION', description: 'Set default project version', default: '0.0.1' },
        ]

        return options.map((option) => {
            if (option === 'SEPARATOR') return option
            // Applies modifications to options
            return { ...option, ...(mods.find(mod => mod.name === option.name) ?? option) }
        })
    }
    /**
     * Retrieves help text
     * @param mods {ModHelpOption[]} Mods which will replace predefined values
     * */
    static helpText(mods: ModHelpOption[] = []) {
        const helpOptions = this._helpOptions(mods).filter(option => option !== 'SEPARATOR')
        // Gets joint args
        const getArgs = (option: typeof helpOptions[number]) => {
            return option.args.map((arg) => arg.length > 1 ? '--' + arg : '-' + arg).join(', ')
        }
        // Gets longest arg name
        const longestArgs = Math.max(...helpOptions.map((opt) =>
            getArgs(opt).length + (opt.value ? opt.value.length + 1 : 0))
        )
        let text = chalk.blue('--- HELP ---\n')
        text += chalk.dim(`VERSION ${this.currentVersion()}\n`)

        text += `${chalk.bold('app-cli')} ${chalk.italic('OPTIONS')}\n\n`
        text += chalk.underline('OPTIONS:\n')

        // Creates line for each option
        const options = this._helpOptions(mods).map((option) => {
            if (option === 'SEPARATOR') return ''
            const arg = (format: boolean = false) => getArgs(option) + (option.value ? ' ' + (format ? chalk.italic(option.value) : option.value) : '')
            return arg(true) +
                ''.padEnd(longestArgs - arg().length, ' ') +
                ' '.repeat(5) +
            option.description +
            (option.default !== undefined ? chalk.dim(` (${option.default})`) : '')
        })
        text += options.join('\n')

        return text
    }
    /** Checks if script contains any args */
    static hasArgs() {
        return Object.keys(this.args(false)).length > 0
    }
    /**
     * Returns args
     * @param withDefaults {boolean} Include default values in return object
     * @param mods {ModHelpOption[]}
     * */
    static args(withDefaults: boolean = true, mods: ModHelpOption[] = []): Args {
        const argv = minimist(process.argv.slice(2))
        return this._helpOptions(mods)
                   .filter(option => option !== 'SEPARATOR')
                   .reduce((obj, opt) => {
                       // Gets any arg which value is defined
                       const argName = opt.args.find((argName) => argv[argName] !== undefined)

                       if (!(argName && argv[argName]) && !withDefaults) return obj

                       return {
                           ...obj,
                           [opt.name]: argName && argv[argName] != undefined ?
                               argv[argName] :
                               opt.default
                       }
        }, {
        } as Args)
    }
    static isProduction() {
        return process.env.NODE_ENV === 'production'
    }
    static currentVersion() {
        const version = process.env.VERSION
        if (version && !version.match(/^\d+\.\d+\.\d+$/)) return defaultData.defaultVersion

        return version
    }
}
const defaultData: ConfigData =  {
    dir: Config.args().dir,
    defaultAuthor: Config.args().defaultAuthor,
    defaultVersion: Config.args().defaultVersion,
    skipFileName: Config.args().skipFileName
}

type HelpOption = {
    name: keyof Args,
    args: string[],
    value?: string,
    description: string,
    default?: any
}
type ModHelpOption = Pick<HelpOption, 'name'> & Partial<HelpOption>

export interface ConfigData {
    dir: string
    defaultAuthor: string | null
    defaultVersion: string
    skipFileName: string
}
export interface Args {
    dir: string
    configPath: string
    defaultAuthor: string | null
    defaultVersion: string
    skipFileName: string
    version: boolean
    help: boolean
    _: string[]
}