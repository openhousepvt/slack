import * as core from '@actions/core'
import {IncomingWebhook, IncomingWebhookResult} from '@slack/webhook'
import {KnownBlock, Block} from '@slack/types'

function jobColor(status: string): string | undefined {
  if (status.toLowerCase() === 'success') return 'good'
  if (status.toLowerCase() === 'failure') return 'danger'
  if (status.toLowerCase() === 'cancelled') return 'warning'
}

async function send(
  url: string,
  jobStatus: string,
  version: string,
  platform: string,
  channel?: string,
  downloadUrl?: string
): Promise<IncomingWebhookResult> {
  const repositoryName = process.env.GITHUB_REPOSITORY
  const repositoryUrl = `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}`

  const runId = process.env.GITHUB_RUN_ID
  const runNumber = process.env.GITHUB_RUN_NUMBER
  const workflowUrl = `${repositoryUrl}/actions/runs/${runId}`

  const branch = process.env.GITHUB_HEAD_REF || (process.env.GITHUB_REF?.replace('refs/heads/', '') as string)
  const actor = process.env.GITHUB_ACTOR

  const ts = Math.round(new Date().getTime() / 1000)

  const blocks: (KnownBlock | Block)[] = [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: ':iphone: *New  build available for download*'
      }
    },
    {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: `*Repository:*\n<${repositoryUrl}|${repositoryName}>`
        },
        {
          type: 'mrkdwn',
          text: `*Branch:*\n${branch}`
        },
        {
          type: 'mrkdwn',
          text: `*Version:*\nv${version}`
        },
        {
          type: 'mrkdwn',
          text: `*Platform:*\n${platform}`
        },
        {
          type: 'mrkdwn',
          text: `*Build #:*\n${runNumber}`
        },
        {
          type: 'mrkdwn',
          text: `*Date:*\n${ts.toString()}`
        },
        {
          type: 'mrkdwn',
          text: `*Workflow Url:*\n<${workflowUrl}|Logs>`
        },
        {
          type: 'mrkdwn',
          text: `*Tiggered By:*\n<https://github.com/${actor}|${actor}>`
        }
      ]
    }
  ]

  if (downloadUrl) {
    blocks.push({
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: {
            type: 'plain_text',
            emoji: true,
            text: 'Download'
          },
          action_id: 'download-button',
          url: downloadUrl,
          style: 'primary'
        }
      ]
    })
  }

  const message = {
    username: 'GitHub Action',
    icon_url: 'https://octodex.github.com/images/original.png',
    channel,
    attachments: [
      {
        color: jobColor(jobStatus),
        blocks
      }
    ]
  }
  core.debug(JSON.stringify(message, null, 2))

  const webhook = new IncomingWebhook(url)
  return await webhook.send(message)
}

export default send
