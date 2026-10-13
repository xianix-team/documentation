---
title: The Executor
description: How Xianix executor Docker images clone repos, install plugins, and run Claude Code or OpenCode prompts.
---

The `xianix-executor` is a short-lived Docker container that does the actual work. Each container clones (or fetches) a Git repository, installs Claude Code plugins, runs a prompt against the codebase, and returns a structured JSON result via stdout.

Xianix also ships an **OpenCode harness** image (`99xio/xianix-executor-opencode`). Both share prepare / worktree isolation; select the harness with [`executor-image`](/agent-configuration/rules/#executor-image--harness-selection). Full architecture, image layout, and dual-harness workflow: **[Multi-Harness Development](/multi-harness-development/overview/)**.

## What's Inside

The executor image is built on Python 3.12 slim with Node.js 20, and includes `git`, `gh` CLI, Azure CLI, and the Claude Code CLI + SDK.

| File | Purpose |
|------|---------|
| `entrypoint.sh` | Git bare-clone/fetch, worktree creation, plugin install, launches Python |
| `execute_plugin.py` | Calls the Claude Code SDK, streams messages, writes JSON result to stdout |
| `requirements.txt` | Pinned Python dependencies |

## Execution Flow

```
1. Read XIANIX_INPUTS → extract repository-url, platform, branch
2. Configure git credentials (GitHub PAT or Azure DevOps PAT)
3. Bare clone (first run) or git fetch (subsequent runs)
4. Create isolated git worktree: /workspace/exec-<EXECUTION_ID>/
5. Install Claude Code plugins from CLAUDE_CODE_PLUGINS
6. Run execute_plugin.py with the interpolated PROMPT
7. Write JSON result to stdout; progress to stderr
8. Clean up worktree on exit
```

## Concurrency Model

The executor uses **git worktrees** to support concurrent executions against the same repo:

```
/workspace/repo/              ← bare clone (persistent volume, shared)
/workspace/exec-<exec-id>/    ← isolated worktree per execution (ephemeral)
```

Multiple containers can mount the same volume simultaneously. Each creates its own worktree, runs independently, and cleans up on exit. Orphaned worktrees from crashed containers are pruned on the next run.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `TENANT_ID` | Yes | Tenant identifier for logging |
| `EXECUTION_ID` | Yes | Unique ID per execution (used as worktree name) |
| `XIANIX_INPUTS` | Yes | JSON object — must include `repository-url` |
| `CLAUDE_CODE_PLUGINS` | Yes | JSON array of plugin descriptors |
| `PROMPT` | Yes | Fully interpolated prompt to execute |
| `ANTHROPIC_API_KEY` | Yes | Anthropic API key |
| `GITHUB_TOKEN` | Conditional | GitHub PAT (injected when available) |
| `AZURE_DEVOPS_TOKEN` | Conditional | Azure DevOps PAT (when `platform=azuredevops`) |

## Output Format

The executor writes a single JSON object to stdout that `ProcessingWorkflow` parses:

```json
{
  "status": "success",
  "result": "...",
  "cost_usd": 0.042,
  "input_tokens": 12500,
  "output_tokens": 3200,
  "session_id": "sess_abc123"
}
```

Progress messages go to stderr.

## Building Locally

```bash
cd Executor/
docker build -t xianix-executor:latest .
```

## Testing Locally

```bash
docker run --rm \
  -e TENANT_ID=local-test \
  -e EXECUTION_ID=test-001 \
  -e 'XIANIX_INPUTS={"repository-url":"https://github.com/org/repo","platform":"github"}' \
  -e CLAUDE_CODE_PLUGINS='[]' \
  -e PROMPT="Summarize this repository." \
  -e ANTHROPIC_API_KEY=sk-ant-... \
  -e GITHUB_TOKEN=ghp_... \
  -v xianix-test-vol:/workspace/repo \
  xianix-executor:latest
```

Separate stdout and stderr:

```bash
docker run ... xianix-executor:latest 1>result.json 2>progress.log
```

## Next Step

Ready to make changes? See [Extending the Agent](/agent-development/extending/).
