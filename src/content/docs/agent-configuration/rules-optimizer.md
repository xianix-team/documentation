---
title: Rules Optimizer
description: Guided chat that installs plugins, writes a webhook rules set, and connects SCM — currently available as a beta release.
---

:::caution[Beta]
**Rules Optimizer** is a **beta** feature. The guided flow and supported plugins may change. After setup, check the resulting [`rules.json`](/agent-configuration/rules/) and webhook wiring before relying on it in production.
:::

**Rules Optimizer** is a guided Agent Studio chat that builds an activation **webhook rules set** for you: pick marketplace plugins, confirm the repository, choose **match-any** triggers, save agent-scoped `rules.json`, create the **Default** Xians webhook, and connect GitHub (automatic) or Azure DevOps (manual Service Hooks).

You do not hand-edit JSON for the common path. Chat slash commands are **not** configured here — this flow only writes **webhook** executions.

---

## Open Rules Optimizer

1. Open the **Xianix AI-DLC Agent** activation in Agent Studio.
2. Switch the conversation topic to **Rules Optimizer** (or follow **Open Rules Optimizer** if general chat redirects you).
3. Send a setup request, for example:
   - `setup pr-reviewer`
   - `install a plugin`
   - `modify what's already configured`

The assistant opens with **Welcome to Rules Optimizer!** and this checklist:

1. Choose plugin(s)
2. Confirm repository
3. Configure match-any / triggers
4. Check secrets
5. Save rules.json
6. Create Xians webhook (Default)
7. Connect SCM (GitHub auto / Azure DevOps manual)
8. Setup completed or failed

Each finished step is marked ✅ or ❌. The run ends with **Setup: ✅ Completed** or **Setup: ❌ Failed**.

If you already named a plugin, setup continues without asking “Would you like to install a plugin?”. If plugins are already installed, you can install another or modify the existing set.

---

## Setup steps

### 1. Choose plugin(s)

Reply with a Ready-to-install plugin short name (for example `pr-reviewer`). The list comes from the [official marketplace](https://github.com/xianix-team/plugins-official) plus a local execution recipe.

- **Ready to install** — name and a one-line description.
- **Coming soon** — listed, but Rules Optimizer cannot configure it yet.

Do not send a repository URL yet. Plugin first, then repo.

### 2. Confirm repository

Platform is inferred from the clone URL host — you are not asked “GitHub or Azure DevOps?”.

| URL host | Platform |
|----------|----------|
| `github.com` | GitHub |
| `dev.azure.com` / `*.visualstudio.com` | Azure DevOps |

What you see depends on repositories already known for this tenant (`…/repo` and `…/repo.git` count as one):

- **None** — paste a clone URL.
- **One** — confirm it, or paste a different URL.
- **Several** — pick a number from the list, or paste a new URL.

Unsupported hosts are rejected. Only GitHub and Azure DevOps cloud are supported.

### 3. Configure match-any / triggers

For each **webhook** execution of the chosen plugin, the assistant lists the **match-any** conditions (OR: the run fires if **any** one matches) and asks how to set them up. Chat / slash-command entries (for example `/pr-review`) are not listed.

For each execution, choose one of:

- **Keep all** listed alternatives
- **Keep only some** (name which)
- **Change the label / trigger value** (for example `pr-review-agent` instead of `ai-dlc/pr/pr-review`)
- **Skip this execution** entirely

GitHub typically uses **labels** and `@xianix` comments. Azure DevOps uses **PR / work-item events**, not GitHub label names.

Confirm the restated plan before secrets and save. Nothing is written to `rules.json` until the later permission step.

**GitHub example (pr-reviewer):**

```
### github-pull-request-review
match-any (runs if any of these match):
1. Label applied — Label `ai-dlc/pr/pr-review` applied to an open PR
2. PR opened with label — PR opened already carrying that label
3. Commits on labeled PR — New commits pushed to an open PR with that label

### github-pr-agent-comment-instruction
match-any:
1. @xianix comment — PR comment mentioning `@xianix`
```

### 4. Check secrets

The assistant checks the vault itself. Never paste secret values in chat. Never expect a yes/no “do you have this key?” question.

Typical keys:

| Key | When |
|-----|------|
| `ANTHROPIC-API-KEY` | Always required for plugin runs |
| `GITHUB-TOKEN` | GitHub repositories (also needed later to auto-register the repo webhook) |
| `AZURE-DEVOPS-TOKEN` | Azure DevOps repositories |

If a key is missing:

```
{KEY} is missing. Add it in Studio → Settings → Secrets (exact key name), then say "done".
```

Add the key with that **exact** name, then reply `done`. Setup continues only after every required key exists.

### 5. Save rules.json

You get a short plan (plugins, webhook executions, agreed match-any) and must approve:

```
Update rules.json with this now?
```

Reply **yes** to write an **agent-scoped** Rules document for this activation only (Studio: Agent) — not system or organization.

Skipped executions and dropped match-any alternatives are applied on save. Custom GitHub labels are baked in at install time.

### 6. Create Xians webhook (Default)

After a successful save you are told how to trigger each plugin, then asked:

```
Create the Xians webhook (Default) for this activation now?
```

Reply **yes** to create or reuse the webhook named **`Default`**. You should see:

- Name
- URL (use this for Azure DevOps Service Hooks)
- Integration id
- Agent / activation

Reply **no** to stop before SCM connect. Trigger instructions remain valid; setup is not marked completed until the webhook exists.

### 7. Connect SCM

#### GitHub (automatic)

After `GITHUB-TOKEN` is present, Rules Optimizer registers the repository webhook and pings it. Typical events: `issues`, `pull_request`, `issue_comment`, `push` (not a standalone `label` event — label changes arrive on `pull_request`).

Success looks like:

```
7. Connect SCM: ✅ Established — ping succeeded on {owner/repo} …
8. Setup: ✅ Completed
```

If registration or ping fails, setup is marked failed with the error from that check.

#### Azure DevOps (manual)

There is no automatic Service Hook. Copy the webhook URL from step 6 and create the subscription yourself:

1. Project settings → Service hooks → **+ Create subscription**
2. Service: **Web Hooks**
3. Events for the installed plugins (for example pr-reviewer: Pull request created, Pull request updated)
4. Action URL = the webhook URL · HTTP POST · Resource details = All
5. Finish

Rules Optimizer does **not** validate the ADO connection. See also the [Azure DevOps setup guide](/miscellaneous/azure-devops).

### 8. Setup completed or failed

A finished run always ends with one of:

- `8. Setup: ✅ Completed`
- `8. Setup: ❌ Failed — {reason}`

---

## Change an existing rules set

Stay in the **Rules Optimizer** topic. Changes are treated as edits, not a restart.

| You want to… | What to say |
|--------------|-------------|
| Install another plugin | `install {plugin}` or `install a new plugin` |
| Change the GitHub trigger label | `use label pr-review-agent` (or similar) |
| Skip or restore an execution | Name the execution and ask to skip or keep it |
| Remove a plugin | `uninstall {plugin}` |
| Point at a different repo | Paste the new clone URL — platform is re-inferred |

After a custom label update you should see **How to trigger** with that label, and a webhook ask if the Default webhook is still missing.

---

## Prerequisites

- An activated Xianix agent in Agent Studio.
- A **GitHub** or **Azure DevOps** clone URL.
- Ability to create secrets in Studio → Settings → Secrets (`ANTHROPIC-API-KEY`, plus `GITHUB-TOKEN` or `AZURE-DEVOPS-TOKEN`).
- For GitHub auto-connect: a `GITHUB-TOKEN` that can manage repository webhooks.

---

## After setup

- Open Knowledge → **Rules** for this activation and compare with [Rules Configuration](/agent-configuration/rules/) / [Webhook Rule Sets](/agent-configuration/rules/webhooks/).
- Trigger the plugin the way the optimizer described (label, `@xianix`, or ADO event).
- For manual GitHub wiring instead of auto-register, see [GitHub setup](/miscellaneous/github).

:::tip[Hand-editing still works]
Rules Optimizer is optional. You can still author or tweak [`rules.json`](/agent-configuration/rules/) directly when you need full control (schedules, chat rule sets, or fields the guided flow does not cover).
:::
