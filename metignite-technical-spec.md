# MetIgnite Web App -- Technical Architecture Spec

**Status:** Approved with amendments (v2)
**Author:** galatea
**Date:** 2026-04-04

---

## 1. Overview

MetIgnite becomes a web app with an AI chat interface, guided launch wizard, and founder dashboard. The 8 existing skills become API-callable modules. Each skill works independently (API) or chained together (orchestration layer for the guided experience).

**Key constraints:**
- All on-chain data from verified sources (DefiLlama, Dune, Solscan, Birdeye). No hardcoded estimates.
- **Channel-agnostic architecture:** The skills API + orchestration layer must support web, Telegram, and Discord from day 1. The Next.js frontend is one client among many. A Telegram bot calls the same `/api/skills/pool-setup` endpoint.
- **Domain:** ignite.meteora.ag (subdomain, brand-endorsed)
- **Auth:** Session-based with optional wallet connect. No accounts. Wallet unlocks token mint verification and on-chain personalization.
- **Pricing:** Free. Rate limit: 50 skill calls per session per day.
- **Compliance:** All content-generating skills run through compliance middleware before returning output.

---

## 2. System Architecture

```
┌─────────────────────────────────────────────────────┐
│                 DELIVERY CLIENTS                     │
│  ┌──────────────┐  ┌────────────┐  ┌─────────────┐  │
│  │ Web (Next.js)│  │ Telegram   │  │ Discord     │  │
│  │ Chat/Wizard/ │  │ Bot        │  │ Bot         │  │
│  │ Dashboard    │  │            │  │             │  │
│  └──────┬───────┘  └─────┬──────┘  └──────┬──────┘  │
│         └────────────────┼─────────────────┘         │
│                          │ HTTP / REST               │
└──────────────────────────┼───────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────┐
│              ORCHESTRATION LAYER (API Routes)        │
│  ┌─────────────────────────────────────────────────┐ │
│  │  Session Manager │ Skill Router │ Rate Limiter  │ │
│  │  (50/session/day)│              │               │ │
│  └─────────────────────────────────────────────────┘ │
└───────────────────────┬──────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│           COMPLIANCE MIDDLEWARE (content skills)      │
│  "never say" list: no "guaranteed returns",          │
│  "investment opportunity", etc. Legal requirement.   │
└───────────────────────┬──────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│                   SKILLS API (8 modules)             │
│  ┌────────────┐ ┌──────────────┐ ┌───────────────┐  │
│  │ pool-setup │ │ tokenomics   │ │ content-draft │  │
│  │            │ │ -review      │ │  [compliant]  │  │
│  ├────────────┤ ├──────────────┤ ├───────────────┤  │
│  │ community  │ │ dex-listing  │ │ outreach      │  │
│  │ -setup     │ │              │ │  [compliant]  │  │
│  │ [compliant]│ │              │ │               │  │
│  ├────────────┤ ├──────────────┤ ├───────────────┤  │
│  │ growth     │ │ analytics    │ │               │  │
│  │ -playbook  │ │              │ │               │  │
│  │ [compliant]│ │              │ │               │  │
│  └────────────┘ └──────────────┘ └───────────────┘  │
└───────────────────────┬──────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│                   DATA LAYER                         │
│  ┌────────────┐ ┌──────────────┐ ┌───────────────┐  │
│  │ DefiLlama  │ │ Dune         │ │ Birdeye       │  │
│  │ API        │ │ Analytics    │ │ API           │  │
│  ├────────────┤ ├──────────────┤ ├───────────────┤  │
│  │ Solscan    │ │ Meteora SDK  │ │ Claude API    │  │
│  │ API        │ │ (on-chain)   │ │ (AI layer)    │  │
│  └────────────┘ └──────────────┘ └───────────────┘  │
└─────────────────────────────────────────────────────┘
```

---

## 3. Frontend Architecture

### Stack
- Next.js 14 (App Router, `src/app/` structure)
- TypeScript strict mode
- Tailwind CSS with Meteora design system tokens
- CVA for component variants
- Framer Motion for interactions
- Inter font via next/font/google
- pnpm package manager

### Routes

```
/                    -- Landing page (what MetIgnite does, CTA to start)
/launch              -- Launch Wizard (step-by-step guided flow)
/launch/[session-id] -- Resume a specific launch session
/chat                -- Freeform AI chat (skill-aware)
/dashboard           -- Founder dashboard (active launches, pool health)
/api/skills/[skill]  -- Individual skill API endpoints
/api/orchestrate     -- Orchestration endpoint
/api/session         -- Session CRUD
```

### Three Core Surfaces

#### 3a. Chat UI
- Streaming AI responses via Claude API
- Skill-aware: the AI knows which skills exist and can invoke them mid-conversation
- Message history persisted per session
- Inline data visualizations when skills return structured data (charts for analytics, tables for tokenomics)
- Input: text field with suggested prompts ("Review my tokenomics", "Set up my DLMM pool")

#### 3b. Launch Wizard
- 6-step guided flow:
  1. **Intake** -- 5 questions about the project (asset type, target market, timeline, budget, existing community)
  2. **Tokenomics Review** -- runs `tokenomics-review` skill, shows scored assessment
  3. **Pool Configuration** -- runs `pool-setup` skill, recommends DLMM/DAMM/DBC with parameters
  4. **Community + Content** -- runs `community-setup` and `content-draft` in parallel
  5. **Listings + Outreach** -- runs `dex-listing` and `outreach` in parallel
  6. **Launch Readiness** -- aggregated score, checklist, go/no-go decision
- Each step shows real results, not placeholders
- Progress bar, ability to go back and re-run steps
- Session state persisted so founders can return later

#### 3c. Founder Dashboard
- Active launches with status (pre-launch, live, post-launch)
- Pool health metrics (from `analytics` skill): volume, fees, TVL, LP count
- Suggested actions: "Your LP lock expires in 3 days", "Volume dropped 40%, consider rebalancing"
- Growth playbook progress tracker
- Weekly update generator (from `growth-playbook` skill)

---

## 4. Skills API Design

Each skill is a standalone API endpoint. Same interface, independent execution.

### Skill Interface (TypeScript)

```typescript
// Shared types for all skills
interface SkillRequest {
  // Unique session ID (optional -- skills work without sessions)
  sessionId?: string;
  // Skill-specific input parameters
  params: Record<string, unknown>;
  // Optional: founder context from intake (shared across skills in a session)
  context?: FounderContext;
}

interface SkillResponse {
  skillId: string;
  status: 'success' | 'error' | 'partial';
  // Structured data output (skill-specific schema)
  data: Record<string, unknown>;
  // Human-readable summary (AI-generated)
  summary: string;
  // Suggested next skills to run
  nextSteps: string[];
  // Data sources used (for transparency)
  sources: DataSource[];
  // Timestamp
  timestamp: string;
}

interface FounderContext {
  projectName: string;
  assetType: 'utility' | 'governance' | 'meme' | 'stablecoin' | 'lst';
  targetMarket: string;
  launchTimeline: string;
  existingCommunitySize: number;
  budget: 'bootstrap' | 'seed' | 'funded';
  // Accumulated data from previously run skills
  completedSkills: Record<string, SkillResponse>;
}

interface DataSource {
  name: string;
  endpoint: string;
  fetchedAt: string;
}
```

### 8 Skills -- Input/Output Contracts

#### 1. `pool-setup`
Maps to: `/ignite-liquidity`
```typescript
// Input
{
  tokenMint: string;          // Token mint address
  assetType: string;          // From context
  initialLiquidity: number;   // USD value
  targetVolume: 'low' | 'medium' | 'high';
}

// Output.data
{
  recommendedPool: 'DLMM' | 'DAMM_v2' | 'DBC';
  binStep: number;            // For DLMM
  baseFee: number;            // Basis points
  positionStrategy: 'spot' | 'curve' | 'bid-ask';
  priceRange: { min: number; max: number };
  estimatedFees: { daily: number; monthly: number; annual: number };
  comparisons: {              // vs other pool types
    poolType: string;
    estimatedFees: number;
    tradeoffs: string;
  }[];
}
```

#### 2. `tokenomics-review`
Maps to: `/ignite-token`
```typescript
// Input
{
  totalSupply: number;
  distribution: { category: string; percentage: number; vestingMonths: number }[];
  initialCirculating: number;
  hasLPLock: boolean;
  hasMultisig: boolean;
}

// Output.data
{
  overallScore: number;       // 0-100
  dimensions: {
    name: string;             // e.g. "Supply Distribution", "Vesting Schedule"
    score: number;
    assessment: string;
    recommendation: string;
  }[];
  redFlags: string[];
  benchmarks: {               // Similar successful launches
    project: string;
    metric: string;
    value: string;
  }[];
}
```

#### 3. `content-draft`
Maps to: `/ignite-growth` (content portion)
```typescript
// Input
{
  contentType: 'launch-thread' | 'tg-announcement' | 'weekly-update' | 'pitch-deck-copy';
  projectName: string;
  keyMessages: string[];
  tone: 'professional' | 'degen' | 'technical';
}

// Output.data
{
  drafts: {
    platform: string;
    content: string;
    characterCount: number;
    hashtags: string[];
  }[];
  editingSuggestions: string[];
}
```

#### 4. `community-setup`
Maps to: `/ignite-community`
```typescript
// Input
{
  platforms: ('telegram' | 'discord' | 'twitter')[];
  communitySize: number;
  assetType: string;
}

// Output.data
{
  platforms: {
    name: string;
    setupChecklist: { task: string; priority: 'critical' | 'high' | 'medium' }[];
    templateMessages: { purpose: string; content: string }[];
    botRecommendations: { name: string; purpose: string; link: string }[];
  }[];
  moderationGuidelines: string;
  growthTactics: { tactic: string; effort: string; impact: string }[];
}
```

#### 5. `dex-listing`
Maps to: `/ignite-prep` (listing portion)
```typescript
// Input
{
  tokenMint: string;
  poolAddress: string;
  projectWebsite: string;
  socialLinks: Record<string, string>;
}

// Output.data
{
  listings: {
    platform: string;          // "DexScreener", "Jupiter", "Birdeye"
    status: 'ready' | 'missing-requirements';
    requirements: { item: string; met: boolean }[];
    submissionUrl: string;
    estimatedTime: string;
  }[];
  verificationChecklist: { item: string; done: boolean }[];
}
```

#### 6. `outreach`
Maps to: `/ignite-growth` (outreach portion)
```typescript
// Input
{
  assetType: string;
  niche: string;
  budget: string;
}

// Output.data
{
  spaces: {
    name: string;
    platform: string;
    audience: number;
    relevance: 'high' | 'medium';
    contactMethod: string;
  }[];
  podcasts: {
    name: string;
    audience: string;
    pitchTemplate: string;
  }[];
  kols: {
    category: string;
    approachStrategy: string;
  }[];
  draftPitches: { target: string; pitch: string }[];
}
```

#### 7. `growth-playbook`
Maps to: `/ignite-growth`
```typescript
// Input
{
  assetType: string;
  launchPhase: 'pre-launch' | 'launch-week' | 'post-launch';
  currentMetrics?: { volume24h: number; holders: number; tvl: number };
}

// Output.data
{
  playbook: {
    week: number;
    theme: string;
    actions: {
      action: string;
      owner: string;
      effort: 'low' | 'medium' | 'high';
      impact: 'low' | 'medium' | 'high';
      iceScore: number;
    }[];
  }[];
  milestones: { metric: string; target: number; timeframe: string }[];
}
```

#### 8. `analytics`
Maps to: `/ignite-weekly` + new on-chain data
```typescript
// Input
{
  poolAddress: string;
  timeframe: '24h' | '7d' | '30d';
}

// Output.data (all from verified sources)
{
  pool: {
    type: string;
    tvl: number;
    volume24h: number;
    fees24h: number;
    feeAPR: number;
    binStep?: number;
    activeBin?: number;
  };
  trends: {
    metric: string;
    current: number;
    previous: number;
    change: number;       // Percentage
  }[];
  lpActivity: {
    totalLPs: number;
    newLPs24h: number;
    removals24h: number;
  };
  alerts: {
    severity: 'info' | 'warning' | 'critical';
    message: string;
  }[];
  sources: DataSource[];   // Transparency: exactly where each number came from
}
```

---

## 5. Orchestration Layer

The orchestration layer chains skills together for the guided wizard experience while keeping each skill independently callable.

### How It Works

```typescript
interface OrchestrationSession {
  id: string;
  founderId: string;
  context: FounderContext;
  steps: {
    stepNumber: number;
    skillIds: string[];           // Skills to run (can be parallel)
    status: 'pending' | 'active' | 'complete' | 'skipped';
    results: Record<string, SkillResponse>;
  }[];
  createdAt: string;
  updatedAt: string;
}
```

### Orchestration Flow

```
INTAKE (5 questions)
    │
    ▼
tokenomics-review ─────────────────┐
    │                               │
    ▼                               │ context flows forward
pool-setup ─────────────────────────┤
    │                               │
    ▼                               │
community-setup ◄──► content-draft  │  (parallel)
    │                               │
    ▼                               │
dex-listing ◄──► outreach           │  (parallel)
    │                               │
    ▼                               │
growth-playbook ◄── all prior data ─┘
    │
    ▼
LAUNCH READINESS SCORE
```

### Launch Readiness Score Algorithm

The wizard's final step produces a **Launch Readiness Score (0-100)** from a weighted average across 6 dimensions. Each dimension maps to one or more skills.

```typescript
interface ReadinessScore {
  overall: number;          // Weighted average, 0-100
  dimensions: {
    name: string;
    weight: number;         // Sums to 1.0
    score: number;          // 0-100 from contributing skill(s)
    source: string[];       // Which skill(s) feed this dimension
  }[];
  verdict: 'not-ready' | 'almost' | 'ready' | 'strong';
}

// Dimension weights and skill mappings:
const READINESS_DIMENSIONS = [
  { name: 'Tokenomics',        weight: 0.25, skills: ['tokenomics-review'] },
  { name: 'Liquidity Setup',   weight: 0.25, skills: ['pool-setup'] },
  { name: 'Community',         weight: 0.15, skills: ['community-setup'] },
  { name: 'Content & Comms',   weight: 0.10, skills: ['content-draft'] },
  { name: 'Listings & Reach',  weight: 0.10, skills: ['dex-listing', 'outreach'] },
  { name: 'Growth Plan',       weight: 0.15, skills: ['growth-playbook'] },
];

// Verdict thresholds:
// 0-39: not-ready (red) -- critical gaps, do not launch
// 40-59: almost (yellow) -- fixable issues, address before launch
// 60-79: ready (green) -- solid foundation, safe to launch
// 80-100: strong (purple glow) -- exceptional preparation

// When a skill has multiple sub-scores (e.g. tokenomics-review has
// dimension scores), average them. When a dimension maps to multiple
// skills (e.g. listings = dex-listing + outreach), average the skills.
// If a skill was skipped, its dimension gets 0 and a "not evaluated" flag.
```

### Key Design Decisions

1. **Context accumulation**: Each skill's output enriches the `FounderContext`. Later skills get better inputs because earlier skills have run. Example: `pool-setup` uses the tokenomics score from `tokenomics-review` to calibrate fee recommendations.

2. **Parallel execution**: Skills that don't depend on each other run in parallel (community-setup + content-draft, dex-listing + outreach). This cuts total wizard time.

3. **Independent callability**: Every skill works without a session. The orchestrator adds context, but skills have sensible defaults. A founder can hit `/api/skills/pool-setup` directly with just a token mint and get useful output.

4. **AI layer**: Claude API generates the `summary` field in each SkillResponse. The structured `data` comes from deterministic logic + verified data sources. AI interprets the data, not invents it.

---

## 6. Data Layer

### Verified Data Sources

| Source | Used By | Data |
|--------|---------|------|
| DefiLlama | analytics, pool-setup | TVL, volume, protocol stats |
| Dune Analytics | analytics, growth-playbook | Custom queries for LP activity, holder counts |
| Birdeye | analytics, pool-setup | Token price, volume, market data |
| Solscan | dex-listing, analytics | On-chain verification, transaction history |
| Meteora SDK | pool-setup, analytics | Pool parameters, bin data, fee calculations |

### Data Fetching Pattern

```typescript
// All external data goes through a unified fetcher with caching + source tracking
interface DataFetcher {
  fetch<T>(source: DataSourceConfig): Promise<{
    data: T;
    source: DataSource;    // Recorded for transparency
    cached: boolean;
    ttl: number;           // Seconds until stale
  }>;
}

// Cache strategy:
// - Pool data: 60s TTL (near-realtime for active management)
// - Market data: 300s TTL
// - Static data (listings, requirements): 3600s TTL
```

### No Hardcoded Data Policy

Every number shown to a founder must trace back to a verified source. The `sources` array in every SkillResponse is mandatory, not optional. If a data source is down, the skill returns `status: 'partial'` with a clear indication of what's missing.

---

## 7. AI Integration

### Claude API Usage

- **Chat UI**: Streaming responses via Claude API. System prompt includes skill descriptions so Claude knows when to invoke skills.
- **Skill summaries**: Each skill calls Claude to generate the human-readable `summary` from structured data. This is interpretation, not fabrication.
- **Launch wizard**: Claude generates contextual guidance between steps ("Your tokenomics scored 72/100. The main concern is...")

### System Prompt Architecture

```
[Base prompt: MetIgnite identity, Meteora expertise]
[Skill registry: what each skill does, when to invoke it]
[Founder context: accumulated from this session]
[Data context: recent skill outputs]
```

The AI never invents on-chain data. It interprets data that skills have fetched from verified sources.

---

## 8. Compliance Middleware

Legal requirement (from ariel's memo). All content-generating skills run through compliance checking before returning to the founder.

### Affected Skills
- `content-draft`
- `community-setup`
- `outreach`
- `growth-playbook`

### Implementation

```typescript
interface ComplianceResult {
  passed: boolean;
  originalText: string;
  cleanedText: string;        // With violations removed/rewritten
  violations: {
    phrase: string;
    reason: string;
    replacement: string;
  }[];
}

// "Never say" list -- phrases that create legal liability
const PROHIBITED_PHRASES = [
  { pattern: /guaranteed\s+returns?/gi, reason: 'Implies financial guarantee' },
  { pattern: /investment\s+opportunit/gi, reason: 'Securities language' },
  { pattern: /risk[- ]free/gi, reason: 'No DeFi activity is risk-free' },
  { pattern: /can('t|\s+not)\s+lose/gi, reason: 'Implies no downside risk' },
  { pattern: /100%\s+safe/gi, reason: 'Nothing in DeFi is 100% safe' },
  { pattern: /financial\s+advice/gi, reason: 'We do not provide financial advice' },
  { pattern: /sure\s+thing|sure\s+bet/gi, reason: 'Implies certainty of returns' },
  { pattern: /moon|to\s+the\s+moon/gi, reason: 'Price prediction language' },
  // Extensible -- ariel maintains the full list
];

// Middleware wraps content-generating skill responses
async function complianceMiddleware(
  skillResponse: SkillResponse
): Promise<SkillResponse> {
  // Scan all text fields in response.data and response.summary
  // Replace violations with compliant alternatives
  // Log violations for audit trail
  // Return cleaned response with compliance metadata
}
```

### Integration Point

The compliance middleware runs as a post-processor in the skill router. It intercepts responses from tagged skills before they reach any delivery client (web, Telegram, Discord).

---

## 9. Error, Loading, and Degraded States

When skills fail or data sources go down, the founder must see clear, actionable UI -- not spinners or blank screens.

### Skill Status Handling

| `status` | UI Treatment |
|-----------|-------------|
| `success` | Full result card with data, summary, and score |
| `partial` | Result card with amber warning banner: "Some data unavailable -- [source] is down. Showing partial results." Missing fields show placeholder with tooltip explaining what's missing. |
| `error` | Red error card: "This step couldn't complete. [Reason]." Retry button. Option to skip step (wizard only). |

### Loading States

- **Skill running:** Skeleton card with pulsing animation + status text ("Analyzing tokenomics...", "Fetching pool data..."). Show estimated time for skills that call external APIs.
- **Streaming chat:** Token-by-token render with cursor. Standard streaming UX.
- **Wizard step transition:** Progress bar advances, next step skeleton loads immediately.

### Degraded Mode Rules

1. **Single data source down:** Skill returns `partial`. UI shows what's available, flags what's missing. Founder can proceed.
2. **Claude API down:** Chat and summaries unavailable. Skills still return structured `data` (deterministic logic works without AI). UI shows data tables/charts without the AI-generated `summary` field.
3. **Multiple sources down:** Skill returns `error`. Wizard offers "Skip this step" with warning that readiness score will be incomplete.
4. **Rate limit hit:** Toast notification: "Daily limit reached (50 calls). Resets in [time]." All skill buttons disabled. Chat still works for non-skill questions.

### Readiness Score with Missing Data

If a founder skips steps or skills return `partial`:
- Skipped dimensions score 0 and show "Not evaluated" badge
- Partial dimensions show their score with an asterisk and "Based on incomplete data" note
- Overall score recalculates with available dimensions only, but the UI clearly shows which dimensions are missing
- Verdict thresholds still apply to the recalculated score

---

## 10. Session Persistence

### Storage Options (to decide)

**Option A: Serverless DB (recommended for MVP)**
- Vercel KV (Redis) for session state
- Fast reads/writes, built-in TTL
- Sessions expire after 30 days of inactivity

**Option B: PostgreSQL (for scale)**
- Supabase or PlanetScale
- Better for querying across sessions (analytics on founder behavior)
- More setup, but needed eventually

**Recommendation:** Start with Vercel KV for MVP. Migrate to PostgreSQL when we need cross-session analytics.

### Session Schema

```typescript
// Stored in KV as JSON
interface StoredSession {
  id: string;
  founderWallet?: string;     // Optional wallet connect -- unlocks mint verification + on-chain personalization
  context: FounderContext;
  orchestration: OrchestrationSession;
  chatHistory: ChatMessage[];
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
}
```

---

## 11. Deployment

- **Hosting:** Vercel (natural fit for Next.js, edge functions for API routes)
- **Domain:** ignite.meteora.ag (subdomain, brand-endorsed)
- **Environment variables:** Claude API key, data source API keys, KV connection
- **Edge functions:** Skill API routes run on edge for low latency
- **Rate limiting:** 50 skill calls per session per day. Session tracked via cookie + optional wallet.
- **Auth:** No accounts. Session-based with browser cookie. Optional wallet connect (Solana wallet adapter) unlocks: token mint ownership verification, personalized on-chain data, pool management shortcuts.

---

## 12. Repo Structure

```
metignite/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Landing page
│   │   ├── layout.tsx                  # Root layout (Inter font, design tokens)
│   │   ├── chat/
│   │   │   └── page.tsx                # Chat UI
│   │   ├── launch/
│   │   │   ├── page.tsx                # Launch wizard
│   │   │   └── [sessionId]/
│   │   │       └── page.tsx            # Resume session
│   │   ├── dashboard/
│   │   │   └── page.tsx                # Founder dashboard
│   │   └── api/
│   │       ├── skills/
│   │       │   ├── pool-setup/route.ts
│   │       │   ├── tokenomics-review/route.ts
│   │       │   ├── content-draft/route.ts
│   │       │   ├── community-setup/route.ts
│   │       │   ├── dex-listing/route.ts
│   │       │   ├── outreach/route.ts
│   │       │   ├── growth-playbook/route.ts
│   │       │   └── analytics/route.ts
│   │       ├── orchestrate/route.ts    # Orchestration endpoint
│   │       └── session/route.ts        # Session CRUD
│   ├── lib/
│   │   ├── skills/
│   │   │   ├── types.ts                # Shared skill types
│   │   │   ├── pool-setup.ts           # Skill logic
│   │   │   ├── tokenomics-review.ts
│   │   │   ├── content-draft.ts
│   │   │   ├── community-setup.ts
│   │   │   ├── dex-listing.ts
│   │   │   ├── outreach.ts
│   │   │   ├── growth-playbook.ts
│   │   │   └── analytics.ts
│   │   ├── orchestrator.ts             # Session + skill chaining logic
│   │   ├── compliance.ts              # Compliance middleware (never-say list)
│   │   ├── rate-limiter.ts            # 50 calls/session/day
│   │   ├── data/
│   │   │   ├── fetcher.ts              # Unified data fetcher with caching
│   │   │   ├── defillama.ts            # DefiLlama adapter
│   │   │   ├── dune.ts                 # Dune adapter
│   │   │   ├── birdeye.ts              # Birdeye adapter
│   │   │   ├── solscan.ts              # Solscan adapter
│   │   │   └── meteora-sdk.ts          # Meteora SDK adapter
│   │   ├── ai/
│   │   │   ├── client.ts               # Claude API client
│   │   │   └── prompts.ts              # System prompts for each context
│   │   └── session/
│   │       └── store.ts                # Session persistence (KV)
│   ├── components/
│   │   ├── ui/                         # Meteora design system components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Input.tsx
│   │   │   └── ...
│   │   ├── chat/
│   │   │   ├── ChatWindow.tsx
│   │   │   ├── MessageBubble.tsx
│   │   │   └── SkillResultCard.tsx     # Renders skill output inline
│   │   ├── wizard/
│   │   │   ├── WizardShell.tsx
│   │   │   ├── StepIndicator.tsx
│   │   │   └── steps/
│   │   │       ├── IntakeStep.tsx
│   │   │       ├── TokenomicsStep.tsx
│   │   │       ├── PoolSetupStep.tsx
│   │   │       ├── CommunityContentStep.tsx
│   │   │       ├── ListingsOutreachStep.tsx
│   │   │       └── ReadinessStep.tsx
│   │   └── dashboard/
│   │       ├── LaunchCard.tsx
│   │       ├── PoolHealthWidget.tsx
│   │       └── ActionSuggestions.tsx
│   └── styles/
│       └── globals.css                 # Meteora design tokens + custom utilities
├── public/
│   └── ...
├── tailwind.config.ts                  # Meteora design system tokens
├── tsconfig.json
├── package.json
├── pnpm-lock.yaml
└── next.config.mjs
```

---

## 13. Skill Export (Phase 4)

Skills ship in two export formats:

1. **OpenAPI specs** -- For developer integrations. Auto-generated from the TypeScript types. Any HTTP client can call the skills API.
2. **Claude Code SKILL.md** -- For agent builders. Each skill exports as a SKILL.md file that Claude Code can use as a slash command. Founders building their own agents get plug-and-play skills.

---

## 14. Resolved Design Decisions

| Decision | Resolution |
|----------|-----------|
| Auth | Session-based, no accounts. Optional wallet connect for mint verification. |
| Pricing | Free. 50 skill calls/session/day rate limit. |
| Domain | ignite.meteora.ag |
| Skill export | Both OpenAPI + SKILL.md |
| atlas coordination | atlas owns chart primitives, galatea composes them |
| orcus input | Using existing intake questions as v1, will incorporate top 5 pain points when orcus delivers |
| Delivery channels | Channel-agnostic API from day 1. Web, Telegram, Discord. |
| Compliance | Mandatory middleware on 4 content-generating skills |

---

## 15. Build Phases

**Phase 1: Foundation (this sprint)**
- Repo scaffold with Meteora design system
- Skill types + 2 skills implemented (pool-setup, tokenomics-review)
- Basic orchestration (sequential, no parallelism yet)
- Landing page + chat UI with streaming
- Priority order: wizard (highest value, activation surface) > chat (secondary) > dashboard (deferred until usage data)

**Phase 2: Full Skills + Wizard**
- Remaining 6 skills
- Launch wizard (6-step flow)
- Parallel skill execution
- Session persistence

**Phase 3: Dashboard + Polish**
- Founder dashboard with live data
- Analytics skill with real-time pool monitoring
- juliet design review pass
- Performance optimization

**Phase 4: Export + API**
- Skill export (OpenAPI + SKILL.md)
- Public API for launchpad integrations
- Rate limiting + API keys
