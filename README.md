# Meteora Ignite

Your AI cofounder for token launches on Solana.

Ignite is an open-source collection of AI skills that gives token founders an AI cofounder. Install it, run it, and get the same strategic thinking that powers Meteora's ecosystem team.

Works with **Claude Code** (slash commands) and **OpenClaw** (24/7 always-on assistant with Telegram, Discord, and browser integrations).

Partners (EasyA, Bags, and others) fork this repo and add their own flavor. The base layer is maintained by Meteora.

## Quick Start — Claude Code

```bash
# Clone the repo
git clone https://github.com/MetClaw/meteora-ignite.git ~/.claude/skills/ignite

# Or install individual skills
cp -r meteora-ignite/skills/ignite-prep ~/.claude/skills/
```

Then use any skill as a slash command:

```
/ignite-prep      — Pre-launch checklist and readiness assessment
/ignite-token     — Tokenomics review and optimization
/ignite-liquidity — Liquidity strategy (DLMM, bins, fee optimization)
/ignite-community — Community building playbook
/ignite-growth    — Post-launch growth strategy
/ignite-legal     — Legal checklist (Bedrock integration)
/ignite-pitch     — Pitch review (founder mode)
/ignite-weekly    — Weekly retro and token holder update
```

## Quick Start — OpenClaw

```bash
# Clone the repo
git clone https://github.com/MetClaw/meteora-ignite.git

# Install all OpenClaw skills
cp -r meteora-ignite/openclaw/* ~/.openclaw/workspace/skills/

# Or install individual skills
cp -r meteora-ignite/openclaw/ignite-prep ~/.openclaw/workspace/skills/
```

OpenClaw skills include everything in Claude Code plus:

```
/ignite-monitor   — 24/7 pool monitor with Telegram/Discord alerts
```

The monitor watches your Meteora pool around the clock: TVL, volume, fees, LP count, community sentiment. Sends GREEN/YELLOW/RED alerts to your Telegram or Discord so you never miss a critical moment.

## What You Get

An AI cofounder that knows:
- How to structure a token launch on Solana
- Meteora's liquidity infrastructure (DLMMs, Dynamic Vaults, DBC)
- Community building from 0 to 15,000+ (LP Army playbook)
- Legal frameworks for onchain capital formation (Bedrock)
- Growth strategies that actually work in DeFi
- What separates the 50% that survive from the 90% that don't

## For Partners

Fork this repo. Add your own skills under `examples/your-platform/`. Your founders get the Meteora base layer plus your customizations.

```
examples/
  easya/          — EasyA Kickstart specific skills
  bags/           — Bags Blueprint specific skills
  your-platform/  — Your fork here
```

## Philosophy

The gates of onchain finance are open to all. Anyone, anywhere, raising. Ideas being funded. Great products being brought to life.

Ignite is the spark.

## Built by

[Meteora](https://meteora.ag) — The liquidity operating system for Solana.

Protected by [Bedrock Foundation](https://x.com/BedrockFndn) — Legal infrastructure for internet capital markets.


