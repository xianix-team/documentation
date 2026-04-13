---
title: Azure DevOps Webhook Setup
description: Connect your Azure DevOps project to the Xianix Agent via a service hook.
---

This guide walks you through connecting your Azure DevOps project to the Xianix Agent — from inviting the agent as a team member to wiring up the Xians webhook URL so it starts receiving events automatically.

:::note[Default rules]
The agent ships with a default set of rules pre-loaded under its **Knowledge Base** in the Agent Studio. The event configuration below matches those default rules. If you want to change which events trigger the agent, you'll need to update both the service hook subscriptions here **and** the rules file — see the [Rules Configuration](./rules) guide.
:::

:::tip[Before you begin]
You need **Project Administrator** permissions in the Azure DevOps project, as well as the Xians webhook URL from [step 2 of the Quick Start](./quickstart#2-create-a-webhook-connection).
:::

## 1. Invite the agent as a team member

The agent needs to be a member of your project team so it can be assigned to pull requests.

In your Azure DevOps project, go to **Project Settings → Teams**, select your team, and click **Add** to invite the agent's user account. If you're using [Agentri](https://agentri.ai/) hosted services, the account to add is `xianix-agent@99x.io`.

:::caution[Authentication token required]
After the invite is accepted, the agent runtime needs a personal access token (PAT) scoped to this project before it can interact with your repos. Contact your Agentri admin to grant the necessary permissions. If you're the admin — or running on self-hosted Xians — follow the [Agent Permissions](../agent-development/tenant-isolation.md) guide to set this up yourself.
:::

## 2. Open Service Hooks

In your Azure DevOps project, navigate to **Project Settings → Service hooks**.

## 3. Create a new subscription

Click **+ Create subscription** and choose **Web Hooks** as the service.

## 4. Choose the trigger event

The default rules listen for pull request activity, so create **two** service hook subscriptions — one for each event type below. This covers PR creation, new commits pushed, and reviewer assignment changes.

| Event | When it fires |
|---|---|
| **Pull request created** | A new pull request is opened |
| **Pull request updated** | New commits pushed, or reviewer assignments changed |

You can optionally add a target branch filter to limit events to specific branches, but make sure **Change** is left as `[Any]` — the agent's rules engine handles finer-grained filtering itself.

## 5. Configure the action

On the **Action** page, paste your Xians webhook URL into the **URL** field. Leave all other settings at their defaults.

Click **Test** to verify connectivity — a `200 OK` response confirms the agent is reachable — then click **Finish** to save the subscription.

## 6. Test the integration

The default rules trigger the agent in three situations:

1. A pull request is **created** with the agent listed as a reviewer.
2. **New commits are pushed** to a PR that already has the agent as a reviewer.
3. The agent is **added as a reviewer** on an existing PR.

See the [PR Reviewer — Azure DevOps rule example](/official-plugins/pr-reviewer/#azure-devops) for the exact `match-any` filters and input mappings behind these triggers.

To run your first end-to-end test, open a pull request and assign it to the agent's user account (`xianix-agent` on Agentri). Then open the **Activity Logs** in the Agent Studio — you should see incoming task logs appear within 60 seconds. Within around 5 minutes, the agent will post a review comment directly on the PR.

## Next steps

- Review the ready-to-use [PR Reviewer Azure DevOps rule](/official-plugins/pr-reviewer/#azure-devops) that ships with the default agent.
- [Configure agent rules](./rules) to customise which events the agent acts on — see the [Azure DevOps examples](./rules#azure-devops-example-work-item-field-with-a-dotted-name) for payload matching patterns specific to Azure DevOps.
- Return to the [Quick Start](./quickstart) if you need a refresher on any earlier steps.
