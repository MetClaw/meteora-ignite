# MetIgnite Data Architecture

## Overview

Every MetIgnite skill currently relies on hardcoded benchmarks and founder-supplied input. No skill fetches live data. This document defines the data layer that replaces hardcoded numbers with live sources, automates metric collection founders currently do manually, and powers the MetIgnite web app with reliable, timestamped data.

---

## 1. Data Requirements by Skill

### pool-setup (ignite-liquidity, ignite-prep)

| Data Point | Current State | Target State |
|---|---|---|
| Pool types available (DLMM, DBC, DAMM v2, Dynamic Vaults) | Hardcoded list | Live from Meteora SDK -- pool type registry |
| Fee tiers per pool type | Hardcoded ranges (0.15%-15%) | Live from on-chain pool configs |
| Bin step configurations | Hardcoded guidelines (1-100+ bps) | Live from DLMM program account data |
| Current liquidity distributions for comparable pools | Not available | Dune query: bin liquidity distribution for top pools by token type |
| Liquidity depth targets ($50K/$100K/$1M) | Hardcoded thresholds | Keep as static benchmarks (these are recommendations, not data) |
| Dynamic fee multiplier average (1.62x) | Hardcoded | DefiLlama or Dune: rolling 30d average fee multiplier |

**Queries needed:**
- `pool_configs`: All active Meteora pool configurations (type, fee tier, bin step, TVL) -- Dune, daily cache
- `bin_distribution`: Liquidity distribution across bins for a given DLMM pool -- Solana RPC (real-time)
- `comparable_pools`: Top pools by token category with performance metrics -- Dune, daily cache

### tokenomics-review (ignite-token, ignite-prep)

| Data Point | Current State | Target State |
|---|---|---|
| Token supply data | Founder-supplied | Solana RPC: mint account (total supply, decimals) |
| Holder distribution | Founder-supplied | Solana RPC or Birdeye: top holder breakdown |
| Vesting schedules | Founder-supplied | Keep as founder input (vesting is off-chain or custom program) |
| Meteora benchmarks ($182.2B vol, $1.31B fees, etc.) | Hardcoded "FY2025" | DefiLlama: live protocol stats, updated daily |
| Comparable token launches | Not available | Dune: tokens launched via DBC/Meteora in last 90 days with outcomes |

**Queries needed:**
- `token_info`: Supply, decimals, authority status for any SPL token -- Solana RPC (real-time)
- `holder_distribution`: Top 20 holders + concentration % -- Birdeye API or Solana RPC (cached 1hr)
- `meteora_protocol_stats`: Volume, fees, TVL, fee-to-LP ratio -- DefiLlama (cached daily)
- `launch_comparables`: DBC launches in last 90d with 7d/30d survival, volume, holder count -- Dune (cached daily)

### analytics (ignite-weekly, ignite-growth)

| Data Point | Current State | Target State |
|---|---|---|
| Pool volume (7d average) | Founder-supplied | DefiLlama or Dune: pool-level volume by day |
| Fees generated (weekly) | Founder-supplied | Dune: fee events from DLMM/DAMM decoded tables |
| LP count (active positions) | Founder-supplied | Dune: unique wallets with open positions in target pool |
| Token price | Founder-supplied | Jupiter Price API or Birdeye (real-time) |
| Trade activity | Founder-supplied | Dune: `dex_solana.trades` filtered by pool |
| Holder count + growth | Founder-supplied | Solana RPC: token account count, or Birdeye |
| X followers, TG members | Founder-supplied | Keep as founder input (no reliable API without auth) |

**Queries needed:**
- `pool_performance`: Daily volume, fees, TVL for a specific pool -- Dune (cached hourly)
- `pool_lp_count`: Unique wallets with active LP positions -- Dune (cached hourly)
- `token_price`: Current price + 24h/7d change -- Jupiter Price API (real-time, <5s cache)
- `token_holders`: Total holder count + daily change -- Birdeye API (cached 1hr)
- `trade_activity`: Recent trades with size, direction, wallet -- Dune or Birdeye (cached 5min)

### growth-playbook (ignite-growth, ignite-community)

| Data Point | Current State | Target State |
|---|---|---|
| Comparable launch data | Not available | Dune: successful Meteora launches, their growth curves, what they did |
| LP Army stats (18,500+ grads) | Hardcoded | Keep as static benchmark (updated quarterly by Meteora team) |
| LP retention benchmarks (50% at 6mo) | Hardcoded | Dune: actual retention cohort from North Star dashboard queries |
| Industry failure rates (53% die, 98% pump.fun fail) | Hardcoded | Keep as static benchmarks (sourced, timestamped) |
| Aggregator listing status | Not available | Jupiter API: check if token is listed/verified |

**Queries needed:**
- `launch_growth_curves`: Weekly holder count, volume, TVL for Meteora launches in last 180d -- Dune (cached daily)
- `retention_benchmarks`: LP retention cohorts across Meteora (feeds from North Star) -- Dune (cached daily)
- `listing_status`: Token verification status on Jupiter, DexScreener -- Jupiter API (cached 1hr)

---

## 2. Data Sources and Access Methods

### DefiLlama API
- **What:** Protocol-level TVL, volume, fees. Pool-level TVL.
- **Auth:** None (public)
- **Rate limits:** ~300 req/5min (generous)
- **Endpoints used:**
  - `/protocol/meteora` -- protocol overview (TVL, volume, fees)
  - `/pool/{poolId}` -- individual pool TVL history
  - `/fees/meteora` -- fee breakdown
- **Reliability:** High. Downtime rare. Data lags ~15min.
- **Use for:** `meteora_protocol_stats`, pool-level TVL trends

### Dune Analytics API (v3)
- **What:** Custom SQL queries against decoded Solana data
- **Auth:** API key required (Dune Pro plan)
- **Rate limits:** Depends on plan. Pro = 100 executions/day, 2500 datapoints/query
- **Namespaces:**
  - `dlmm_solana.*` -- decoded DLMM events (swaps, liquidity adds/removes, fee claims)
  - `meteora_pools_solana.*` -- decoded DAMM events
  - `meteora_vault_solana.*` -- decoded vault events
  - `dex_solana.trades` -- curated swap table (filter by `project_program_id`)
- **Key program IDs for filtering:**
  - DLMM: `LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo`
  - DAMM v2: `cpamdpZCGKUy5JxQXB4dcpGPiikHawvSWAd6mEn1sGG`
  - DBC: `dbcij3LWUppWqq96dh6gJWwBifmcGfLSB5D4DuSMaqN`
  - Dynamic Vault: `24Uqj9JCLxUeoC3hGfh5W3s9FM9uCHDS2SG3LYwBpyTi`
- **Use for:** `pool_performance`, `pool_lp_count`, `launch_comparables`, `launch_growth_curves`, `retention_benchmarks`, `comparable_pools`, `trade_activity`

### Jupiter Price API
- **What:** Real-time token prices on Solana
- **Auth:** None (public)
- **Rate limits:** Generous (thousands/min)
- **Endpoint:** `/price?ids={mint_address}`
- **Reliability:** Very high. Primary Solana price oracle.
- **Use for:** `token_price`

### Birdeye API
- **What:** Token analytics -- holders, price history, trade activity
- **Auth:** API key required (free tier available)
- **Rate limits:** Free = 100/min, Pro = 1000/min
- **Endpoints used:**
  - `/defi/token_overview` -- holder count, market cap, volume
  - `/defi/price_history` -- OHLCV data
  - `/defi/txs/token` -- recent trades
- **Use for:** `holder_distribution`, `token_holders`, price history fallback

### Solana RPC
- **What:** Direct on-chain reads -- token mints, account data, pool state
- **Auth:** RPC endpoint (Helius, QuickNode, or public)
- **Rate limits:** Varies by provider. Helius free = 50 req/s
- **Methods used:**
  - `getAccountInfo` -- read pool/mint accounts
  - `getTokenSupply` -- total supply for a mint
  - `getProgramAccounts` -- enumerate positions (expensive, use sparingly)
- **Use for:** `token_info`, `bin_distribution` (DLMM pool state)

### Meteora SDK (TypeScript)
- **What:** High-level wrapper for Meteora program interactions
- **Package:** `@meteora-ag/dlmm` (npm)
- **Status:** Available and maintained. Wraps DLMM pool creation, position management, fee claiming.
- **Use for:** Pool type enumeration, bin configuration validation, transaction parameter generation (Phase 2)
- **Note:** SDK is execution-focused. For read-only analytics, Dune/RPC is more efficient.

---

## 3. Real-Time vs Cached

### Real-time (fetch on every request, cache <30s)
| Data | Source | Why Real-Time |
|---|---|---|
| Token price | Jupiter Price API | Founders making decisions need current price |
| Bin liquidity distribution | Solana RPC | Pool state changes with every trade |
| Token supply / authority | Solana RPC | Needs to reflect latest state for tokenomics review |

### Short cache (5min to 1hr)
| Data | Source | Cache Duration | Why |
|---|---|---|---|
| Trade activity | Dune or Birdeye | 5min | Recent activity context, not tick-level |
| Holder count | Birdeye | 1hr | Changes slowly, expensive to compute |
| Holder distribution (top 20) | Birdeye | 1hr | Changes slowly |
| Pool LP count | Dune | 1hr | Position changes aren't high-frequency |
| Pool performance (volume, fees) | Dune | 1hr | Hourly granularity is sufficient for dashboards |
| Listing status | Jupiter API | 1hr | Rarely changes |

### Daily cache (refresh once per day)
| Data | Source | Why Daily |
|---|---|---|
| Meteora protocol stats | DefiLlama | Macro numbers, slow-moving |
| Launch comparables | Dune | Historical analysis, doesn't change intraday |
| Growth curves | Dune | Weekly data points, daily refresh is generous |
| Retention benchmarks | Dune | Cohort data, weekly cadence |
| Comparable pool configs | Dune | Pool configs rarely change |

### Static benchmarks (updated manually, quarterly)
| Data | Current Value | Source |
|---|---|---|
| LP Army graduates | 18,500+ | Meteora team |
| LP retention rate (6mo) | 50% | Meteora internal data |
| Industry failure rates | 53% token death rate, 98% pump.fun failure | Published research |
| Blockworks transparency score | 40/40 | Blockworks |
| Liquidity depth targets | $50K / $100K / $1M | MetIgnite recommendation |

---

## 4. Data Quality Rules

### Rule 1: Every number has a named source and timestamp
```
{
  "value": 182200000000,
  "label": "Total Volume",
  "source": "defillama",
  "fetched_at": "2026-04-04T12:00:00Z",
  "cache_ttl": 86400
}
```
No number appears in any UI or skill output without this metadata envelope.

### Rule 2: No hardcoded estimates in the app layer
All current hardcoded benchmarks in skills must be moved to a `benchmarks.json` file with explicit source attribution and last-verified dates. When a benchmark can be replaced with a live query, it is -- but the benchmark file remains as fallback.

### Rule 3: Stale data is labeled, not hidden
If a data source is down or cache is expired beyond 2x TTL:
- Display the last known value with a "Last updated: [timestamp]" label
- Add a visual indicator (muted text, subtle warning icon)
- Never show stale data as if it were fresh

### Rule 4: Source unavailable = "Unavailable", not zero
If a source cannot be reached and no cached value exists:
- Display "Unavailable" with the source name
- Never substitute zero, null, or an estimate
- Log the failure for monitoring

### Rule 5: Cross-source validation for critical metrics
For metrics that appear in multiple skills (volume, fees, TVL):
- DefiLlama is primary source
- Dune is validation source
- If sources disagree by >10%, flag it and use the more conservative number
- Log discrepancies for investigation

---

## 5. Data Layer Architecture

```
┌─────────────────────────────────────────────┐
│              MetIgnite Web App               │
│         (Next.js 14 + Meteora DS)            │
├─────────────────────────────────────────────┤
│              Data Service Layer              │
│  ┌─────────┐ ┌──────────┐ ┌──────────────┐  │
│  │ Cache    │ │ Query    │ │ Benchmark    │  │
│  │ Manager  │ │ Registry │ │ Store        │  │
│  │ (Redis/  │ │ (named   │ │ (benchmarks  │  │
│  │  memory) │ │  queries │ │  .json with  │  │
│  │          │ │  + TTLs) │ │  sources)    │  │
│  └────┬─────┘ └────┬─────┘ └──────────────┘  │
│       │            │                          │
├───────┼────────────┼──────────────────────────┤
│       │    Source Adapters                     │
│  ┌────┴─────┬──────┴────┬──────────┬────────┐ │
│  │DefiLlama │  Dune v3  │ Jupiter  │Birdeye │ │
│  │ Adapter  │  Adapter  │ Adapter  │Adapter │ │
│  └──────────┴───────────┴──────────┴────────┘ │
│  ┌──────────┬───────────┐                     │
│  │ Solana   │ Meteora   │                     │
│  │ RPC      │ SDK       │                     │
│  └──────────┴───────────┘                     │
└─────────────────────────────────────────────┘
```

### Components

**Cache Manager:** Handles TTL-based caching per query. In-memory for MVP (Map with expiry), Redis for production. Every cache entry stores the full metadata envelope (value + source + timestamp + TTL).

**Query Registry:** Named queries with their source adapter, parameters, TTL, and fallback behavior. Example:
```typescript
const QUERIES = {
  meteora_protocol_stats: {
    adapter: 'defillama',
    endpoint: '/protocol/meteora',
    ttl: 86400, // 24hr
    transform: (raw) => ({ volume: raw.total24h, tvl: raw.tvl, fees: raw.fees24h })
  },
  token_price: {
    adapter: 'jupiter',
    endpoint: '/price',
    ttl: 5, // 5s
    params: ['mint_address'],
    transform: (raw) => ({ price: raw.data[mint].price })
  }
}
```

**Benchmark Store:** `benchmarks.json` -- static numbers with source attribution. Loaded at startup. Updated via PR (human-in-the-loop for benchmark changes).

**Source Adapters:** One adapter per external API. Each adapter handles auth, rate limiting, error handling, and response normalization. All adapters implement:
```typescript
interface DataAdapter {
  fetch(endpoint: string, params: Record<string, string>): Promise<DataEnvelope>
  healthCheck(): Promise<boolean>
}
```

---

## 6. Query Catalog

### Dune Queries (require authoring + saving)

| Query ID | Description | Key Filters | TTL |
|---|---|---|---|
| `meteora_pool_performance` | Daily volume, fees, TVL for a pool | pool_address, date range | 1hr |
| `meteora_pool_lps` | Unique wallets with open LP positions | pool_address | 1hr |
| `meteora_launch_comparables` | DBC launches in last 90d: volume, holders, survival | date range | 24hr |
| `meteora_growth_curves` | Weekly holder/volume/TVL for Meteora launches | token_mint, date range | 24hr |
| `meteora_retention_cohorts` | LP retention by first-deposit-week | program_id, cohort window | 24hr |
| `meteora_pool_configs` | Active pool configs: type, fee tier, bin step, TVL | program_id | 24hr |
| `meteora_recent_trades` | Recent trades for a pool | pool_address, limit | 5min |

### API Calls (direct, no custom query needed)

| Call ID | Source | Endpoint | TTL |
|---|---|---|---|
| `token_price` | Jupiter | `/price?ids={mint}` | 5s |
| `token_info` | Solana RPC | `getAccountInfo({mint})` | 30s |
| `token_supply` | Solana RPC | `getTokenSupply({mint})` | 30s |
| `holder_overview` | Birdeye | `/defi/token_overview?address={mint}` | 1hr |
| `holder_top20` | Birdeye | `/defi/token_security?address={mint}` | 1hr |
| `protocol_stats` | DefiLlama | `/protocol/meteora` | 24hr |
| `protocol_fees` | DefiLlama | `/fees/meteora` | 24hr |
| `listing_check` | Jupiter | `/tokens?tags=verified` | 1hr |

---

## 7. Web App Consumption (for galatea)

The data service exposes a single unified API for the web app:

```typescript
// Server-side data fetching (Next.js server components / API routes)
import { getData } from '@/lib/data-service'

// Real-time price
const price = await getData('token_price', { mint: 'So11...1112' })
// Returns: { value: 148.52, source: 'jupiter', fetched_at: '...', fresh: true }

// Cached analytics
const perf = await getData('meteora_pool_performance', { pool: 'abc...xyz', days: 30 })
// Returns: { value: [...daily rows...], source: 'dune', fetched_at: '...', fresh: true }

// Unavailable source
const broken = await getData('holder_overview', { mint: 'abc' })
// Returns: { value: null, source: 'birdeye', error: 'rate_limited', fresh: false }
```

Every response includes `source`, `fetched_at`, and `fresh` (boolean: within TTL). The web app can use `fresh` to show staleness indicators.

---

## 8. Migration Path: Skills to Live Data

**Phase 1 (MVP, now):** Skills continue using hardcoded benchmarks. Web app uses the data service for live data. `benchmarks.json` is the single source of truth for static numbers -- both skills and web app read from it.

**Phase 2 (MCP integration):** Skills gain access to the data service via MCP server. When a founder runs `/ignite-token`, the skill can call `getData('token_info', { mint })` to pull live supply data instead of asking the founder to type it.

**Phase 3 (full automation):** Founder provides their token mint address once. Every skill auto-populates with live data. Founder only supplies qualitative input (plans, strategies, narratives).

---

## 9. Open Questions for Coordination

**For galatea (web app):**
- What's the preferred data fetching pattern? Server components, API routes, or client-side SWR?
- Do you need WebSocket/SSE for real-time price updates, or is polling acceptable?
- What's the error state UX? I've defined the data contract -- need alignment on how "unavailable" renders.

**For orcus (founder metrics):**
- Which metrics do founders actually look at first? Volume? Holders? Price? Need to prioritize the data pipeline.
- Are there founder-relevant metrics I'm missing that aren't in the current skills?
- What "comparable launch" criteria matter most? Same market cap tier? Same token category? Same pool type?

---

## 10. Implementation Priority

1. **benchmarks.json** -- Extract all hardcoded numbers from skills into one file with sources and dates. Immediate, no external deps.
2. **DefiLlama adapter** -- Easiest source, no auth, highest value (protocol stats). 2-3 hours.
3. **Jupiter Price adapter** -- Real-time prices, no auth, critical for tokenomics review. 1-2 hours.
4. **Birdeye adapter** -- Holder data, needs API key. 2-3 hours.
5. **Dune adapter + query authoring** -- Most complex, highest value. Needs API key + query testing. 1-2 days.
6. **Solana RPC adapter** -- Direct on-chain reads for token info, bin distributions. 3-4 hours.
7. **Cache Manager** -- In-memory for MVP. 2-3 hours.
8. **Unified getData API** -- Ties it all together. 3-4 hours.
