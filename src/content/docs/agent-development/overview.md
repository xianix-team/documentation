---
title: Overview
description: What the Xianix Agent is, how it's built, and how the pieces fit together.
---

The Xianix Agent is a .NET 10 application that listens for webhook events from GitHub and Azure DevOps, evaluates them against a set of rules, and — when a rule matches — spins up an isolated Docker container to run an AI-powered task against the target repository.

Think of it as a pipeline: **webhook in → rules match → container runs → results out**.

## Architecture at a Glance

```
Webhook (GitHub / Azure DevOps)
        │
        ▼
┌────────────────────────────────────┐
│  Xianix Agent (.NET 10)            │
│                                    │
│  XianixAgent                       │
│    └─ OnWebhook                    │
│         └─ EventOrchestrator       │
│              └─ RulesEvaluator     │  ← reads rules.json from Xians Knowledge
│                    │               │
│         (per match)│               │
│                    ▼               │
│         ProcessingWorkflow         │
│           └─ ContainerActivities   │  ← Docker API
└────────────────────┬───────────────┘
                     │
            Docker Engine
                     │
        ┌────────────▼────────────┐
        │  xianix-executor        │
        │  (ephemeral container)  │
        │                         │
        │  git clone/fetch        │
        │  install plugins        │
        │  run Claude Code prompt │
        │                         │
        │  stdout → JSON result   │
        └─────────────────────────┘
```

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | .NET 10 |
| Workflows | Temporal (via Xians platform SDK) |
| DI | `Microsoft.Extensions.DependencyInjection` |
| Container management | `Docker.DotNet` |
| Env config | `DotNetEnv` |
| Tests | xUnit + NSubstitute |

## Project Structure

```
the-agent/
├── TheAgent/                     # .NET control plane
│   ├── Program.cs                # Entry point — DI, startup
│   ├── EnvConfig.cs              # Typed env-var accessors
│   ├── Constants.cs              # Agent name, well-known strings
│   ├── Agent/
│   │   └── XianixAgent.cs        # Registers agent, configures webhooks
│   ├── Orchestrator/
│   │   └── EventOrchestrator.cs  # Routes webhooks → rules → workflows
│   ├── Rules/
│   │   └── WebhookRulesEvaluator.cs  # Evaluates rules.json
│   ├── Workflows/
│   │   └── ProcessingWorkflow.cs # Single-event lifecycle
│   ├── Activities/
│   │   └── ContainerActivities.cs # Docker container lifecycle
│   └── Knowledge/
│       └── rules.json            # Default rules (uploaded to Xians)
│
├── TheAgent.Tests/               # xUnit tests
│
├── Executor/                     # Executor Docker image
│   ├── Dockerfile
│   ├── entrypoint.sh             # Git clone/fetch, plugin install
│   ├── execute_plugin.py         # Claude Code SDK runner
│   └── requirements.txt
│
├── Docs/                         # Internal design docs
└── TestScripts/                  # Webhook simulation scripts
```

## Next Step

Head to [Getting Started](/agent-development/getting-started/) to clone the repo and run the agent locally.
