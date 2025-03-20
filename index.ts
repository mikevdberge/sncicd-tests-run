//import * as github from '@actions/github'
import * as core from '@actions/core'
import { AppProps, Errors } from './src/App.types'
import App from './src/App'

export const configMsg = '. Configure Github secrets please'

export const run = (): void => {
    let instance
    try {
        const errors: string[] = []
        const { nowUsername = '', nowPassword = '', nowApikey = '', nowInstallInstance = '', nowInstance = '' } = process.env

        if (!nowApikey) {
            if (!nowUsername) {
                errors.push(Errors.USERNAME)
            }
            if (!nowPassword) {
                errors.push(Errors.PASSWORD)
            }
        }
        if (!nowInstallInstance && !nowInstance) {
            errors.push(Errors.INSTALL_INSTANCE)
        }
        if (errors.length) {
            core.setFailed(`${errors.join('. ')}${configMsg}`)
        } else {
            if (nowInstallInstance) {
                instance = nowInstallInstance + '.service-now.com'
            } else {
                instance = nowInstance
            }
            const props: AppProps = {
                instance,
                username: nowUsername,
                password: nowPassword,
                apikey: nowApikey,
            }
            const app = new App(props)

            app.runTests().catch(error => {
                core.setFailed(error.message)
            })
        }
    } catch (error: any) {
        core.setFailed(error.message)
    }
}

run()
