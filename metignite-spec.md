# MetIgnite -- Product Spec (MVP)

## What It Is

An agentic AI system that acts as a cofounder for founders launching tokens within Meteora's ecosystem. Not a chatbot. Not a social media manager. A system that knows Meteora's infrastructure deeply and walks founders through the entire launch lifecycle.

## The Problem

Founders launching tokens on Meteora face 25+ tasks across liquidity strategy, community building, content creation, legal compliance, listing verification, and ongoing pool management. Most founders:

- Don't know which pool type to use (DLMM vs DBC vs DAMM v2)
- Pick wrong bin steps and fee tiers (leaving money on the table or creating bad UX)
- Miss critical trust signals (no LP lock, no vesting, no multisig)
- Have no post-launch plan (go dark after day 2)
- Don't know how to rebalance or manage liquidity

The result: high failure rate, bad ecosystem reputation, wasted opportunity.

## Who It's For

**Primary:** Founders launching serious tokens on Solana via Meteora (not pump-and-dump). People building products who need help with the web3/DeFi ops layer.

**Secondary:** Launchpads (LetsBonk, Bags, pump.fun, star.fun, etc.) that want to offer founder support to their users.

**Not for:** Fully automated token snipers, rug operators, or anyone looking to avoid doing real work.

## What Already Exists

8 Claude Code skills (live in /skills directory):

1. `/ignite-prep` -- Pre-launch readiness check (7 dimensions, scored)
2. `/ignite-token` -- Tokenomics review and benchmarking
3. `/ignite-liquidity` -- DLMM pool configuration (bin step, fee tier, position strategy)
4. `/ignite-community` -- Community building playbook
5. `/ignite-growth` -- Growth framework with ICE scoring
6. `/ignite-pitch` -- Stress test the idea before launch
7. `/ignite-legal` -- Bedrock Foundation + compliance checklist
8. `/ignite-weekly` -- Token holder update templates with real data

These work today as slash commands in Claude Code. A founder installs them and gets expert Meteora-specific guidance.

## What's Missing (MVP Scope)

### Phase 1: Intelligent Orchestration (Next Build)

The 8 skills exist in isolation. A founder has to know which one to run when. The MVP adds an **orchestrator** that:

- Asks 5 questions to understand the founder's situation
- Automatically runs the right skills in the right sequence
- Tracks progress across sessions (remembers what was done, what's pending)
- Provides a single "launch readiness dashboard" view

Implementation: One new skill (`/ignite`) that acts as the meta-orchestrator. Uses Pentagon-style memory to persist state across sessions.

### Phase 2: Active Execution (v2)

Move from advisory to action:

- **Pool setup assistance:** Generate the exact transaction parameters for pool creation
- **Content drafting:** Write launch threads, TG announcements, weekly updates based on real pool data
- **Monitoring:** Track pool health metrics and alert on significant changes (large LP exits, fee rate changes, liquidity gaps)
- **Listing automation:** Generate DexScreener verification submissions, Jupiter listing requests

Implementation: MCP server that connects to Solana RPC + Meteora SDK. Skills gain the ability to read on-chain data and prepare transactions (founder still approves/signs).

### Phase 3: Multi-Channel (v3)

- **Telegram bot:** Founders interact via TG instead of CLI
- **API:** Launchpads integrate MetIgnite into their onboarding flow
- **Dashboard:** Web UI showing launch progress, pool health, suggested actions

Implementation: Telegram bot using Claude API. REST API wrapper around the skill system. Dashboard built in Next.js with the Meteora design system.

## What MetIgnite Is NOT

- A replacement for the founder doing real work (you still build the product, talk to users, show your face)
- A fully autonomous agent that posts without approval
- A generic AI assistant rebranded (every skill is Meteora-specific)
- A way to automate rug pulls or low-effort token spam

## Adoption Arc

- **Unaware:** Founder has never heard of MetIgnite
- **Curious:** Sees a launch that credits MetIgnite, or sees the ecosystem page
- **Understanding:** Installs one skill, runs `/ignite-prep`, gets a brutally honest readiness score
- **Using:** Runs through the full launch sequence, ships with confidence
- **Evangelizing:** Credits MetIgnite in their launch thread, tells other founders

## Success Metrics

- Number of founders who complete a full launch sequence using MetIgnite
- Survival rate of MetIgnite-assisted launches (30-day holder retention)
- Pool quality metrics (proper LP locks, vesting, liquidity depth)
- NPS from founders who used it

## Technical Stack

- **Skills:** Markdown files (SKILL.md) readable by any LLM
- **Orchestrator:** Claude Code skill with Pentagon memory integration
- **Execution layer (v2):** MCP server, Solana web3.js, Meteora SDK
- **Telegram bot (v3):** Claude API + Telegram Bot API
- **Dashboard (v3):** Next.js 14 + Meteora design system

## Open Questions

1. Should MetIgnite be Meteora-branded or standalone? (Recommendation: Meteora-branded -- it's an ecosystem tool, not a separate product)
2. Do launchpads want to white-label it? If so, the skill architecture already supports forking.
3. Should the readiness score be public/shareable? (Could create social proof for high-scoring launches)
4. How does Bedrock Foundation integration work in practice? (Ariel is researching this)
