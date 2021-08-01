import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import send from '../src/slack'
import {getSlackMessage} from './mocks/slack_message'

/** Action parameters */
const url = 'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX'
const version = '1.0.0'
const platform = 'Android'
const channel = '#github-ci'
const downloadUrl = 'https://www.github.com'

/** Action Context */
const runNumber = '8'
const runId = '100143423'
const actor = 'arch10'
const repositoryName = 'openhousepvt/slack'

process.env.CI = 'true'
process.env.GITHUB_WORKFLOW = 'build-test'
process.env.GITHUB_RUN_ID = runId
process.env.GITHUB_RUN_NUMBER = runNumber
process.env.GITHUB_ACTION = 'self2'
process.env.GITHUB_ACTIONS = 'true'
process.env.GITHUB_ACTOR = actor
process.env.GITHUB_REPOSITORY = repositoryName
process.env.GITHUB_EVENT_NAME = 'push'
process.env.GITHUB_EVENT_PATH = '/home/runner/work/_temp/_github_workflow/event.json'
process.env.GITHUB_WORKSPACE = '/home/runner/work/slack/slack'
process.env.GITHUB_SHA = '68d48876e0794fba714cb331a1624af6b20942d8'
process.env.GITHUB_REF = 'refs/heads/master'
process.env.GITHUB_HEAD_REF = ''
process.env.GITHUB_BASE_REF = ''
process.env.GITHUB_SERVER_URL = 'https://github.com'
process.env.GITHUB_API_URL = 'https://github.com'
process.env.GITHUB_GRAPHQL_URL = 'https://api.github.com/graphql'

describe('Github release notification to slack', () => {
  const mockAxios = new MockAdapter(axios, {delayResponse: 200})

  test('should send on failure', async () => {
    mockAxios
      .onPost()
      .reply(() => {
        return [200, {status: 'ok'}]
      })
      .onAny()
      .reply(500)

    const jobStatus = 'failure'

    const res = await send(url, jobStatus, version, platform, channel, downloadUrl)
    await expect(res).toStrictEqual({text: {status: 'ok'}})

    const slackMessage = getSlackMessage(jobStatus, platform, version, runNumber, runId, actor, downloadUrl)

    expect(JSON.parse(mockAxios.history.post[0].data)).toStrictEqual(slackMessage)

    mockAxios.resetHistory()
  })

  test('should send on cancelled', async () => {
    mockAxios
      .onPost()
      .reply(() => {
        return [200, {status: 'ok'}]
      })
      .onAny()
      .reply(500)

    const jobStatus = 'cancelled'

    const res = await send(url, jobStatus, version, platform, channel, downloadUrl)
    await expect(res).toStrictEqual({text: {status: 'ok'}})

    const slackMessage = getSlackMessage(jobStatus, platform, version, runNumber, runId, actor, downloadUrl)

    expect(JSON.parse(mockAxios.history.post[0].data)).toStrictEqual(slackMessage)

    mockAxios.resetHistory()
  })

  test('should send on success', async () => {
    mockAxios
      .onPost()
      .reply(() => {
        return [200, {status: 'ok'}]
      })
      .onAny()
      .reply(500)

    const jobStatus = 'success'

    const res = await send(url, jobStatus, version, platform, channel, downloadUrl)
    await expect(res).toStrictEqual({text: {status: 'ok'}})

    const slackMessage = getSlackMessage(jobStatus, platform, version, runNumber, runId, actor, downloadUrl)

    expect(JSON.parse(mockAxios.history.post[0].data)).toStrictEqual(slackMessage)

    mockAxios.resetHistory()
  })

  mockAxios.reset()
})
