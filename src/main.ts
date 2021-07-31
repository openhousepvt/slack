import * as core from '@actions/core'
import {readFileSync} from 'fs'
import send from './slack'

async function run(): Promise<void> {
  try {
    // debug output of environment variables and event payload
    for (const k of Object.keys(process.env).sort((a, b) => a.localeCompare(b))) {
      core.debug(`${k} = ${process.env[k]}`)
    }
    const event = process.env.GITHUB_EVENT_PATH as string
    const readEvent = (): object => JSON.parse(readFileSync(event, 'utf8'))
    core.debug(JSON.stringify(readEvent()))

    const url = process.env.SLACK_WEBHOOK_URL as string
    const jobStatus = core.getInput('status', {required: true}).toUpperCase()
    const channel = core.getInput('channel', {required: false})
    const downloadUrl = core.getInput('downloadUrl', {required: false})
    const version = core.getInput('version', {required: true})
    const platform = core.getInput('platform', {required: true})

    if (url) {
      await send(url, jobStatus, version, platform, channel, downloadUrl)
      core.debug('Sent to Slack.')
    } else {
      core.info('No "SLACK_WEBHOOK_URL" secret configured. Skip.')
    }
  } catch (error) {
    core.setFailed(error.message)
    core.error(error.stack)
  }
}

run()
