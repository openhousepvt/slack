export const getSlackMessage = (
  jobStatus: string,
  platform: string,
  version: string,
  runNumber: string,
  runId: string,
  actor: string,
  downloadUrl?: string
) => {
  const server = 'https://github.com'
  const repository = 'openhousepvt/slack'
  const repositoryUrl = `${server}/${repository}`
  const workflowUrl = `${server}/${repository}/actions/runs/${runId}`
  const branch = 'master'

  const blocks: any = [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `:iphone: *New ${platform} build available for download*`
      }
    },
    {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: `*Repository:*\n<${repositoryUrl}|${repository}>`
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
          text: expect.stringMatching(/.*/)
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

  return {
    username: 'GitHub Action',
    icon_url: 'https://octodex.github.com/images/original.png',
    channel: '#github-ci',
    attachments: [
      {
        color: jobColor(jobStatus),
        blocks
      }
    ]
  }
}

function jobColor(status: string): string {
  if (status.toLowerCase() === 'success') return 'good'
  if (status.toLowerCase() === 'failure') return 'danger'
  if (status.toLowerCase() === 'cancelled') return 'warning'
  return 'danger'
}
