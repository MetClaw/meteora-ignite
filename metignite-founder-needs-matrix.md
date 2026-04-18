# MetIgnite Founder Needs Matrix

**Research compiled: April 2026**
**Purpose:** Map the real pain points, failure modes, and competitive landscape for token founders launching on Meteora/Solana -- to inform MetIgnite's feature priorities.

---

## 1. Pre-Launch Struggles

### 1.1 Tokenomics Design

**The problem:** Founders don't know how to structure supply, allocation, or distribution. Most copy what they see without understanding why.

- Common distribution at launch ranges from 20-50% of total supply. Reserve tokens for liquidity, team (with vesting), future development, and community rewards. ([Source](https://www.soltokenlaunch.com/solana-token-distribution/))
- Many tokens reward early buyers at the expense of newcomers, creating unsustainable price bubbles. Some projects promise unrealistic APYs (1000%+ staking rewards) that collapse when new buyers stop coming. ([Source](https://medium.com/@pr_54561/top-7-tokenomics-mistakes-that-kill-crypto-projects-and-how-to-avoid-them-4331c34d4d96))
- Poor token distribution leads to ownership concentration. Large exchange distribution programs and broad airdrops flooded the market with holders who had little connection to the underlying product. ([Source](https://www.coindesk.com/business/2026/01/06/why-crypto-s-new-token-issues-are-falling-flat-and-what-comes-next))

**MetIgnite opportunity:** `/ignite-token` already addresses this. Needs to benchmark against real survival data, not just theoretical frameworks.

### 1.2 Pool Type Selection (AMM vs DLMM vs DAMM v2 vs DBC)

**The problem:** Meteora now offers four pool types. Founders have no framework for choosing.

| Pool Type | Best For | Cost | Key Feature |
|-----------|----------|------|-------------|
| **DAMM v2** | New token launches (recommended for most) | ~0.022 SOL | Concentrated liquidity, anti-sniper fees, single-sided launch, Token2022 support |
| **DAMM v1** | Established pairs wanting dual yield | Higher | Swap fees + lending yield |
| **DLMM** | Active LPs who want bin-level control | ~0.25 SOL | Granular bin placement, dynamic fees (avg 6-7% for launch pools) |
| **DBC** | Bonding curve launches (memecoin-style) | Low | Auto-graduates to DAMM v1 or v2 once threshold hit |

Sources: [Meteora DAMM v2 Medium post](https://meteoraag.medium.com/damm-v2-single-sided-launch-pools-80dba79ac934), [Meteora Docs](https://docs.meteora.ag)

**Key insight:** DAMM v2 is now the default recommendation for new launches -- 90% cheaper than DLMM, simpler to configure, and has built-in anti-sniper suite. DLMM is for sophisticated LPs, not first-time launchers.

### 1.3 Bin Step & Fee Tier Selection (DLMM-specific)

**The problem:** Founders who use DLMM don't understand bin steps or fee tiers.

- **Bin step** = price interval between adjacent bins, in basis points (1 bp = 0.01%)
- Smaller steps (e.g., 1-5 bp): More volume captured, narrower price range per position. Best for stable pairs.
- Larger steps (e.g., 25-100 bp): Wider range coverage, less volume. Better for volatile pairs.
- Base fee correlates with bin step: higher bin step = higher base fee is typical.
- Fees adjust dynamically based on volatility -- rise during turbulence, drop during stability.
- Maximum 1,400 bins per position constrains range width.

Source: [Meteora DLMM Strategies](https://docs.meteora.ag/overview/products/dlmm/strategies-and-use-cases)

**MetIgnite opportunity:** `/ignite-liquidity` should recommend specific bin step + fee tier combos based on token type (memecoin, utility, stablecoin) with clear reasoning.

### 1.4 Initial Liquidity Requirements

**The problem:** Founders either provide too little liquidity (causing extreme volatility and manipulation) or don't understand how much is needed.

- Pools with low liquidity are more susceptible to manipulation, large price fluctuations, and pump-and-dump schemes. ([Source](https://smithii.io/en/launch-token-or-memecoin-solana-ultimate-guide/))
- Practical guideline from on-chain data: minimum 50k-100k TVL (preferably above 500k), with a 10x ratio between TVL and 24h volume as a health signal. ([Source](https://x.com/chennai2london/status/1847627934879699091))
- No liquidity post-launch causes tokens to become illiquid and lose value immediately.

### 1.5 Trust Signal Setup

**The problem:** Experienced traders check for trust signals before buying. Most founders skip them.

Critical trust signals founders miss:
- **Authority revocation:** Experienced traders will not buy tokens with active mint or freeze authority. ([Source](https://smithii.io/en/3-errors-when-make-a-solana-token/))
- **LP lock:** Without locked liquidity, projects are viewed as high risk. 100% of initial LP tokens locked is the standard. ([Source](https://blog.team.finance/how-liquidity-locks-prevent-rug-pulls-and-how-strong-projects-use-them-correctly/))
- **Vesting schedules:** Linear vesting post-initial lock is safer than cliff unlocks. Prevents sudden large liquidity withdrawals. ([Source](https://www.cointracker.io/learn/vesting-period))
- **Multisig:** Multi-signature wallet for admin functions decentralizes control. No single team member can emergency-withdraw. ([Source](https://www.chainscorelabs.com/en/guides/memecoins-meme-culture-and-community-dynamics/memecoin-security-and-auditing/how-to-architect-a-liquidity-locking-strategy-post-launch))

### 1.6 Community Setup

**The problem:** Fair launches require strong pre-launch marketing because there's no presale to build initial community.

- Start marketing 2-4 weeks before launch. Build on Discord, X, Telegram.
- Host AMAs and X Spaces for real-time engagement.
- Airdrops as marketing (Bonk's model drove massive engagement).
- Most founders skip this entirely and launch to silence.

Source: [Smithii Launch Guide](https://smithii.io/en/launch-token-or-memecoin-solana-ultimate-guide/)

---

## 2. Launch Day Failures

### 2.1 Sniper Bot Attacks

**Scale of the problem:** Analysis of 300+ Solana token launches showed ~84% exhibited sniper activity within 5 seconds, with bots capturing 65% of launch liquidity. Average retail loss: 0.47 SOL per trader, affecting ~92,000 users over six months (~$4.3M total). ([Source](https://medium.com/@mbarichard18/sniped-on-arrival-unmasking-solanas-token-sniper-bots-and-securing-the-future-of-fair-launches-03fd6cc8b784))

**How bots work:**
- Monitor Solana RPC endpoints every 50ms for new token mints
- Pre-construct swap transactions based on expected token addresses
- Broadcast across multiple RPC endpoints simultaneously
- Rotate across dozens of wallets to avoid detection

**Meteora's countermeasures (DAMM v2 Anti-Sniper Suite):**
- Higher fees at launch that decay over time to an ending base fee
- Fee scaling based on trade size (bigger trades = higher fees)
- Alpha Vault: whitelisted early access for genuine supporters before pool activation
- Optional vesting on claimed tokens to discourage quick dumps

Source: [Meteora Anti-Sniper Suite](https://docs.meteora.ag/meteoras-anti-sniper-suite-a.s.s./meteoras-anti-sniper-suite)

### 2.2 No Visibility on DEX Screeners

**The problem:** New tokens need trading activity to appear on DEX platforms, but without visibility, organic traders never find them.

- DEX aggregators rank tokens based on: 24h volume, unique makers, holder count, and liquidity depth.
- Tokens below certain thresholds don't appear in trending sections or search results.
- DEXScreener lists tokens automatically once they have a liquidity pool and at least one transaction -- no fee required.
- Token appears within 10-30 minutes of first transaction.
- Verification (logo, links, project details) requires a separate submission at marketplace.dexscreener.com.

Source: [DEXScreener Docs](https://docs.dexscreener.com/token-listing)

**Common mistakes:** Unverified pool contracts, liquidity below minimum threshold, missing token metadata, taxable tokens that distort prices.

### 2.3 Wrong Pool Configuration

**The problem:** Once a DLMM launch pool is created for a token pair using `initializeCustomizablePermissionlessLbPair`, only one pool can exist for that pair. If you create it with wrong parameters, the transaction for a new pool with different parameters will fail. ([Source](https://docs.meteora.ag))

This is a one-shot decision for DLMM launch pools. Get it wrong and you're stuck.

### 2.4 Price Manipulation

**The problem:** Low-liquidity pools are trivially manipulable.

- 90% of new tokens fail on day one, often because founders rush creation and forget about liquidity. ([Source](https://smithii.io/en/create-liquidity-pool-solana/))
- The $SOBB case study: a whale wallet achieved 100x profit within 4-5 days through coordinated sniper purchases and rapid dumps -- pattern repeated across multiple launches. ([Source](https://medium.com/@mbarichard18/sniped-on-arrival-unmasking-solanas-token-sniper-bots-and-securing-the-future-of-fair-launches-03fd6cc8b784))

---

## 3. Post-Launch Kill Factors (First 30 Days)

### 3.1 The Macro Picture: Most Tokens Die

- **53.2% of all cryptocurrencies** tracked on GeckoTerminal are now inactive (13.4M out of 25.2M). ([Source](https://www.coingecko.com/research/publications/how-many-cryptocurrencies-failed))
- **11.6 million tokens failed in 2025** alone, representing 86.3% of all failures since 2021.
- Q4 2025 was the worst quarter on record: 7.7M failures (34.9% of all-time collapses).
- On pump.fun specifically: **only 1.4% of tokens graduate**, and most graduated tokens still end up with market values near zero. Only 3% of users earned more than $1,000. ([Source](https://www.chaincatcher.com/en/article/2139008))

### 3.2 LP Exodus & Rug Pulls

- $6 billion lost to rug pulls in 2025 alone. ([Source](https://coinedition.com/crypto-2025-rug-pulls-fast-crashes-what-the-crypto-community-must-learn-and-how-to-spot-rugs/))
- Mantra Network (OM): 17 wallets moved 43.6M tokens ($227M) to exchanges, triggering a 94% price crash in under an hour. $5.52B in losses -- largest single rug pull of 2025. ([Source](https://coincub.com/biggest-crypto-rug-pulls/))
- Pattern: large holders move tokens to exchanges en masse, triggering panic selling cascade.

### 3.3 Volume Death Spirals

- Tokens become liquid before they are needed, widely held before communities form, and actively traded before playing a meaningful role in the product. ([Source](https://www.coindesk.com/markets/2026/01/14/more-than-half-of-all-crypto-tokens-have-failed-and-most-died-in-2025))
- DWF Labs warned of "liquidity wars" -- as retail capital thins and competition intensifies, newer tokens face rising barriers to survival.
- Multiple launchpads have seen daily token launches collapse 90%+ from their peaks -- the platforms survive but most of the tokens they spawned do not.

### 3.4 No Product, No Utility, No Reason to Hold

- "No product-market fit, zero real users, no revenue -- and then teams try to slap a token on top." ([Source](https://rushimanche.medium.com/why-most-crypto-projects-fail-within-their-first-year-the-real-reason-explained-fc98e9862761))
- For a token to hold value, it needs demand driven by usage, not marketing.
- Most tokens issued before utility conditions existed, hoping community would follow.

### 3.5 Founder Goes Dark

- "Don't disappear after launch. Keep posting updates. Engage with your community. Active creators build stronger communities." ([Source](https://smithii.io/en/deploy-your-own-solana-token/))
- Teams that unify community data, measure outcomes, and iterate turn liquidity into relationships and relationships into resilience. ([Source](https://www.metacrm.inc/blog/how-meteora-turns-liquidity-into-community-growth))

---

## 4. Competitor Audit: Solana Launch Platforms

### 4.1 pump.fun + PumpSwap

| Attribute | Detail |
|-----------|--------|
| **Model** | Bonding curve. 1B tokens per coin, 800M on curve, 200M reserved for liquidity |
| **Graduation** | $90K market cap threshold. Migrates to PumpSwap (previously Raydium) |
| **Graduation rate** | ~1.4% historically. Recently peaked at 1.15% weekly |
| **Fees** | 1% per trade. Creator fee introduced May 2025. Migration fee eliminated (was 6 SOL) |
| **PumpSwap** | Launched March 2025. 0.25% trading fee (0.20% to LPs, 0.05% protocol). Uniswap V2 style. |
| **Revenue** | $800M+ lifetime. $1M+ daily. |
| **Market share** | Dominant (~80% as of early 2026) but swings wildly |
| **Weakness** | Extracts revenue without ecosystem reinvestment. No vetting. 98.6% of tokens fail to graduate. |

Sources: [pump.fun Fees](https://pump.fun/docs/fees), [Wikipedia](https://en.wikipedia.org/wiki/Pump.fun), [CoinEdition](https://coinedition.com/solana-launchpad-battle-pumpfun-letsbonk/), [Cryptopolitan](https://www.cryptopolitan.com/pump-fun-graduating-tokens-break-to-1-15-of-new-launches/)

### 4.2 star.fun

| Attribute | Detail |
|-----------|--------|
| **Model** | Crowdfunding for startups using Solana + Meteora liquidity pools |
| **Differentiator** | AI-powered code review of founders' GitHub repos as vetting |
| **STAR token** | Access token for exclusive funding rounds. FDV target: $12.5M |
| **Tokenomics** | Revenue used for buyback-and-burn. 25% team allocation, 25% ecosystem |
| **Graduation** | Similar to pump.fun -- tokens must graduate for bigger pools |
| **Status** | Early stage. Raised $3,600 in debut. Targeting real projects, not memecoins. |

Sources: [Blockworks](https://blockworks.co/news/starfun-vc-capital), [ainvest](https://www.ainvest.com/news/star-fun-raises-3-600-crypto-launchpad-debut-2506/)

### 4.3 Raydium LaunchLab

| Attribute | Detail |
|-----------|--------|
| **Model** | No-code, permissionless launchpad. Flexible bonding curves (linear, logarithmic, exponential). |
| **Graduation** | 85 SOL default benchmark. No migration fees. Direct integration with Raydium AMM. |
| **Fees** | 1% base trading fee. 50% community pool, 25% RAY buybacks, 25% infrastructure. |
| **Creator earnings** | Up to 10% of trading fees + Fee Key NFTs (10% of Raydium AMM fees) |
| **Quote tokens** | SOL, USDC, USDT, or jitoSOL |
| **Security** | LP automatically locked or burned post-launch |
| **Market position** | Powers LetsBonk backend. Only 2 graduations vs pump.fun's 204 in recent data. |

Sources: [BeInCrypto](https://beincrypto.com/learn/launchlab-explained/), [Altcoin Buzz](https://www.altcoinbuzz.io/cryptocurrency-news/raydium-unveils-launchlab-for-seamless-token-creation/)

### 4.4 LetsBonk.fun

| Attribute | Detail |
|-----------|--------|
| **Model** | Near-identical bonding curve to pump.fun. Built on Raydium LaunchLab. |
| **Differentiator** | 30% of revenue allocated to buyback-and-burn BONK tokens. Creator incentives (10% LP fees). |
| **Market share** | Volatile -- peaked at 58.5% (19,620 tokens/day), crashed below 3%, back to ~16.7% |
| **Revenue** | $8.4M+ platform revenue at peak |
| **Status** | Rising challenger. Strong community/BONK ecosystem alignment. |

Source: [Blocmates](https://www.blocmates.com/articles/all-you-need-to-know-about-the-solana-launchpad-wars)

### 4.5 Other Notable Platforms

| Platform | Model | Status |
|----------|-------|--------|
| **Moonshot** | Mobile-first, fiat on/off ramps (PayPal, cards). 80% supply traded, 20% to creators. | Only 44 lifetime graduations. Quality model struggling for traction. |
| **Boop.fun** | 75% supply for trading, 5% to BOOP stakers. 400 SOL graduation threshold. | Declining. BOOP token down 83% from ATH. High barrier discourages launches. |
| **Jup Studio** | Jupiter's launchpad. Dynamic bonding curve, 50% trading fees to creators. | 11K tokens at launch, declining. Late entrant. |
| **Gavel** | Aggregator covering multiple launchpads. | Feed-based discovery tool. |

Source: [Blocmates Launchpad Wars](https://www.blocmates.com/articles/all-you-need-to-know-about-the-solana-launchpad-wars)

---

## 5. On-Chain Patterns: What Separates Survivors from the Dead

### 5.1 The Numbers

- 20.2 million tokens listed by end of 2025 (up from 428K in 2021). ([Source](https://www.coingecko.com/research/publications/how-many-cryptocurrencies-failed))
- pump.fun alone: 20,000+ tokens deployed daily, only 100-200 graduate. The most prolific deployer created 3,357 tokens -- only 16 graduated. ([Source](https://www.chaincatcher.com/en/article/2139008))
- Of those that graduate, most still end up with market values near zero.

### 5.2 Survivor Characteristics (Synthesized from Research)

| Factor | Dead Projects | Survivors |
|--------|--------------|-----------|
| **Liquidity depth** | Below 50K TVL | 100K+ TVL, ideally 500K+ |
| **LP lock** | No lock or short lock | 100% LP locked, 6-12 months minimum |
| **Authority** | Mint/freeze authority active | All authorities revoked |
| **Vesting** | No vesting, cliff unlocks | Linear vesting schedules |
| **Community** | No pre-launch community | 2-4 weeks of pre-launch engagement |
| **Post-launch activity** | Founder goes dark after day 2 | Consistent updates, weekly comms |
| **Product** | No utility, pure speculation | Token tied to actual usage/product |
| **Fee structure** | Default/random | Optimized for pair volatility |
| **Anti-sniper** | No protection | Alpha Vault + fee decay + size-based fees |
| **Volume/TVL ratio** | Extremely high (pure speculation) | ~10x TVL-to-volume ratio (healthy) |

### 5.3 Meteora-Specific Patterns

- DAMM v2 is now the recommended pool type for launches -- adopted by platforms like star.fun and LetsBonk for graduation pools. Cost: 0.022 SOL vs 0.25 SOL for DLMM.
- Dynamic fees average 6-7% for launch pools (DLMM), adjusting with volatility.
- DBC (Dynamic Bonding Curve) for memecoin-style launches that auto-graduate to DAMM v1/v2.
- Alpha Vault as anti-sniper mechanism used alongside launch pools.
- Meteora Q1 2026 added on-chain limit orders, one-click zaps, and redesigned interface.

Sources: [Meteora Medium](https://meteoraag.medium.com/damm-v2-single-sided-launch-pools-80dba79ac934), [CryptoAdventure Review](https://cryptoadventure.com/meteora-review-2026-solana-liquidity-pools-dynamic-fees-and-lp-risks/)

### 5.4 Dune Dashboards for Tracking

- [Meteora DLMM Fee Stats](https://dune.com/kagren0/dlmm-fee-stats) -- tracks fee distribution across DLMM pools
- [Meteora Overview](https://dune.com/sigrlami/meteora-overview) -- general Meteora metrics
- [Blockworks Meteora LP Analytics](https://blockworks.com/analytics/meteora/meteora-lps) -- LP behavior and pool liquidity
- [Blockworks DBC Pool Liquidity](https://blockworks.com/analytics/meteora/meteora-dynamic-bonding-curve-dbc/meteora-total-pool-liquidity-by-token-origination) -- DBC pool origination data

---

## 6. Summary: Top 10 Founder Pain Points (Ranked by Impact)

| # | Pain Point | Stage | MetIgnite Skill |
|---|-----------|-------|-----------------|
| 1 | No product-market fit / no utility | Pre-launch | `/ignite-pitch` |
| 2 | Wrong pool type selection | Pre-launch | `/ignite-liquidity` |
| 3 | No anti-sniper protection | Launch day | `/ignite-liquidity` |
| 4 | Insufficient liquidity depth | Launch day | `/ignite-liquidity` |
| 5 | Missing trust signals (LP lock, authority revocation, vesting) | Pre-launch | `/ignite-prep` |
| 6 | No pre-launch community | Pre-launch | `/ignite-community` |
| 7 | Founder goes dark post-launch | Post-launch | `/ignite-weekly` |
| 8 | No DEXScreener visibility / listing verification | Launch day | `/ignite-growth` |
| 9 | Bad tokenomics (concentration, no vesting, unsustainable rewards) | Pre-launch | `/ignite-token` |
| 10 | No growth plan beyond launch day | Post-launch | `/ignite-growth` |

---

## 7. Competitive Positioning for MetIgnite

### What no competitor does:
- **Guided pool configuration** -- every launchpad says "create a pool" but none walk founders through WHICH pool, WHICH parameters, and WHY
- **Post-launch lifecycle support** -- all platforms end at graduation; none help founders survive the first 30 days
- **Trust signal enforcement** -- no platform requires or guides LP locks, vesting, multisig, authority revocation as a prerequisite
- **Founder accountability** -- no platform provides weekly update frameworks or community engagement systems
- **Meteora-native expertise** -- no AI tool has deep knowledge of DAMM v2 vs DLMM vs DBC tradeoffs

### MetIgnite's structural advantage:
MetIgnite doesn't compete with pump.fun, LetsBonk, or star.fun for token creation. It competes for **founder outcomes**. The 98.6% failure rate on pump.fun is the market opportunity -- MetIgnite exists to move founders from the 98.6% to the 1.4% (and beyond graduation, into the even smaller cohort that actually survives 30 days).
