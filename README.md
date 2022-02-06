![Build](https://github.com/openhousepvt/slack/workflows/build-test/badge.svg)

# Notify Slack of GitHub Release

A simple and flexible Slack integration with GitHub Release.

<img src="./docs/images/example1.png" width="540" title="Slack Example #1">

## Configuration

### Environment Variables (`env`)

#### `SLACK_WEBHOOK_URL` (required)

Create a Slack Webhook URL using either the
[Incoming Webhooks App](https://slack.com/apps/A0F7XDUAZ-incoming-webhooks?next_id=0)
(preferred) or by attaching an incoming webhook to an existing
[Slack App](https://api.slack.com/apps) (beware, channel override not possible
when using a Slack App):

    env:
      SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}

### Input Parameters (`with`)

#### `status` (required)

The `status` must be defined. It can either be the current job status
using:

      with: 
        status: ${{ job.status }}

or a hardcoded custom status such as "starting" or "in progress":

      with: 
        status: in progress

#### `version` (required)

The `version` must be defined. It is the release version of your project:

      with: 
        version: '1.0.0'

#### `platform` (required)

The `platform` must be defined. It is the release platform for which this release is for:

      with: 
        platform: 'Android'

#### `channel` (optional)

To override the channel or to send the Slack message to an individual
use:

      with: 
        status: ${{ job.status }}
        version: '1.0.0'
        platform: 'Android'
        channel: '#workflows'

**Note: To override the channel the Slack webhook URL must be an
Incoming Webhook URL. See https://api.slack.com/faq#incoming_webhooks**

### Conditionals (`if`)

To ensure the Slack message is sent even if the job fails add the
`always()` function:

    if: always()

or use a specific status function to only run when the job status
matches. All possible status check functions are:

* `success()` (default)
* `always()`
* `cancelled()`
* `failure()`

## Examples

To send a Slack message when a workflow job has completed add the
following as the last step of the job:

    - uses: openhousepvt/slack@v1.3.2
      with: 
        status: ${{ job.status }}
      if: always()

The default Slack channel for the configured webhook can be overridden
using either another channel name `#channel` or a username `@username`.

    - uses: openhousepvt/slack@v1.3.2
      with: 
        status: ${{ job.status }}
        channel: '#workflows'

or

    - uses: openhousepvt/slack@v1.3.2
      with: 
        status: ${{ job.status }}
        channel: '@nick'

### Complete example

    name: Docker Build and Push

    on:
      push:
        branches: [ master, release/* ]

    jobs:
      build:
        runs-on: ubuntu-latest
        env:
          REPOSITORY_URL: docker.pkg.github.com
          IMAGE_NAME: ${{ github.repository }}/alerta-cli
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
        steps:
          - name: Checkout
            uses: actions/checkout@v2
          - name: Variables
            id: vars
            run: echo "::set-output name=SHORT_COMMIT_ID::$(git rev-parse --short HEAD)"
          - name: Build image
            id: docker-build
            run: >-
              docker build
              -t $IMAGE_NAME
              -t $REPOSITORY_URL/$IMAGE_NAME:${{ steps.vars.outputs.SHORT_COMMIT_ID }}
              -t $REPOSITORY_URL/$IMAGE_NAME:latest .
          - name: Docker Login
            env:
              DOCKER_USERNAME: ${{ secrets.DOCKER_USERNAME }}
              DOCKER_PASSWORD: ${{ secrets.GITHUB_TOKEN }}
            run: docker login $REPOSITORY_URL --username "$DOCKER_USERNAME" --password "$DOCKER_PASSWORD"
          - name: Publish Image
            id: docker-push
            run: docker push $REPOSITORY_URL/$IMAGE_NAME
          - uses: openhousepvt/slack@v1.3.2
            with:
              status: ${{ job.status }}
              version: '1.0.0'
              platform: 'Docker'
              channel: '#workflows'
            if: success()


## Troubleshooting

To enable runner diagnostic logging set the `ACTIONS_RUNNER_DEBUG` secret to `true`.

To enable step debug logging set the `ACTIONS_STEP_DEBUG` secret to `true`.

See https://docs.github.com/en/free-pro-team@latest/actions/managing-workflow-runs/enabling-debug-logging

## References

* Slack messages for GitHub Action https://github.com/act10ns/slack
* GitHub Actions Toolkit https://github.com/actions/toolkit/tree/main/packages/github
* GitHub Actions Starter Workflows https://github.com/actions/starter-workflows
* Slack Incoming Webhooks https://slack.com/apps/A0F7XDUAZ-incoming-webhooks?next_id=0

* Env vars https://docs.github.com/en/free-pro-team@latest/actions/reference/environment-variables
* Webhook Payloads https://docs.github.com/en/free-pro-team@latest/developers/webhooks-and-events/webhook-events-and-payloads#webhook-payload-object-common-properties
* GitHub Actions Cheat Sheet https://github.github.io/actions-cheat-sheet/actions-cheat-sheet.html

## License

Copyright (c) 2021 OpenHouse Pvt. Available under the MIT License.
