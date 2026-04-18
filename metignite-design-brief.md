# MetIgnite -- Design Brief

**Author:** juliet (design authority)
**Status:** Draft for ophelia review
**Date:** 2026-04-04

---

## 1. DESIGN DIRECTION

### Mood

Confident mission control. Not a toy, not enterprise SaaS. Think: the cockpit of a rocket you're about to launch. Dark, focused, with warm orange light where your hands need to go.

The founder should feel like they have a cofounder who actually knows what they're doing. The UI reinforces competence, not complexity.

### Tone Spectrum

```
Intimidating ----[---X--------]---- Dumbed Down
                  ^
            HERE: Confident + Clear
```

We sit closer to "expert" than "friendly wizard." Founders are serious people spending real money. But we never make them feel dumb for not knowing bin steps.

### Visual Identity

- **Background:** #08080c (deepest) for main canvas, #12121c for panels/sidebars, #181825 for cards
- **Orange (#f54b00):** Owns every CTA, every "do this next" moment, progress indicators
- **Purple (#6e45ff):** Atmospheric only -- glows, gradients, ambient light. Never on buttons.
- **Success green (#24c98d):** Completed steps, healthy metrics, "you're good" signals
- **Danger red (#f04438):** Blockers, critical warnings, things that will kill your launch
- **Typography:** Inter everywhere. All-caps wide-tracked (2px+) for section headers. JetBrains Mono for data, addresses, code snippets.
- **Radius:** 8px on everything. No exceptions.
- **Grain:** Subtle noise texture on gradient backgrounds and hero areas.
- **Spacing:** Generous. When in doubt, add more space. 24px minimum between card groups.

### Signature Visual Elements

1. **The Ignite Gradient** -- linear 135deg from #f54b00 through #E44D8A to #6e45ff. Used on hero text, progress bars, the launch readiness score ring.
2. **Radial glow** -- Warm orange glow behind the chat input (where the founder types). Purple glow behind dashboard metrics. Glows signal "this is alive."
3. **Grain overlay** -- 2% opacity noise on all gradient surfaces. Prevents flat digital look.
4. **Pulsing dot** -- Small orange dot that pulses next to "what to do next" items. A heartbeat. The system is alive and watching.

---

## 2. KEY SCREENS

### Screen 1: ONBOARDING (First 3 Seconds)

**Goal:** Founder lands here and decides to care.

**Layout:**
```
┌──────────────────────────────────────────────────┐
│  [Meteora logo]              [Connect Wallet]    │
│                                                  │
│                                                  │
│         YOUR AI COFOUNDER FOR                    │
│         TOKEN LAUNCHES                           │
│         ~~~~~~~~~~~~~~~~~~~~~~~~                 │
│         (ignite gradient on text)                │
│                                                  │
│    One question to start. We figure out          │
│    the rest together.                            │
│                                                  │
│    ┌──────────────────────────────────────┐      │
│    │  What are you building?          ⏎  │      │
│    └──────────────────────────────────────┘      │
│    (warm orange glow behind input)               │
│                                                  │
│    "Not a chatbot. A cofounder that knows        │
│     Meteora's infrastructure cold."              │
│                                                  │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐         │
│  │ Launch  │  │ Pool    │  │ Growth  │         │
│  │ Prep    │  │ Config  │  │ Plan    │         │
│  │ Score   │  │ Wizard  │  │ Engine  │         │
│  └─────────┘  └─────────┘  └─────────┘         │
│  (3 capability cards, subtle purple border)      │
│                                                  │
│  TRUSTED BY 47 LAUNCHES  |  $12M TVL GUIDED     │
│  (social proof bar, text-tertiary color)         │
└──────────────────────────────────────────────────┘
```

**Winston's Star check:**
- Symbol: The single input field with the glow. That IS the product.
- Slogan: "Your AI cofounder for token launches"
- Surprise: Just one question. No signup form, no 5-step onboarding.
- Salient idea: You don't have to figure out Meteora alone.
- Story: "47 launches trusted this" -- you're joining a movement.

**Interaction:** Input field has magnetic pull animation (cursor approaches, field subtly scales). Typing triggers a soft particle burst on each keystroke. Submit fades the whole page into the chat view -- no hard page transition.

### Screen 2: CHAT INTERFACE (The Core Experience)

**Goal:** Feel like talking to a smart cofounder, not a support bot.

**Layout:**
```
┌──────────────────────────────────────────────────┐
│  [◀ Back]   MetIgnite Chat    [⚡ Launch Status] │
├──────────────────────────────────────────────────┤
│                                                  │
│  ┌─ AI ──────────────────────────────────────┐   │
│  │ Based on what you've told me, you're      │   │
│  │ building a DeFi utility token. Let me     │   │
│  │ run your launch readiness check.          │   │
│  │                                           │   │
│  │ ┌─ READINESS SCORE ─────────────────┐    │   │
│  │ │     ◉ 62/100                      │    │   │
│  │ │     (circular progress, gradient)  │    │   │
│  │ │                                    │    │   │
│  │ │  ✅ Tokenomics      82            │    │   │
│  │ │  ✅ Liquidity Plan   71            │    │   │
│  │ │  ⚠️  Trust Signals   34            │    │   │
│  │ │  ❌ Community        28            │    │   │
│  │ │  ✅ Legal            65            │    │   │
│  │ └───────────────────────────────────┘    │   │
│  │                                           │   │
│  │ Your trust signals are the biggest gap.   │   │
│  │ Want to fix that first?                   │   │
│  └───────────────────────────────────────────┘   │
│                                                  │
│  ┌─ You ─────────────────────────────────────┐   │
│  │ Yes, what do I need?                      │   │
│  └───────────────────────────────────────────┘   │
│                                                  │
├──────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────┐  [⏎]  │
│  │  Type your message...                │        │
│  └──────────────────────────────────────┘        │
│  [📎 Attach]  [⚡ Skills]  [📊 Dashboard]       │
└──────────────────────────────────────────────────┘
```

**Key design decisions:**

- **AI messages get a subtle left border** in the ignite gradient. Not a colored background -- too chatbot-y.
- **Rich cards inline** -- readiness scores, pool configs, action checklists render as interactive cards inside the chat. Not plain text.
- **The send button is orange.** The only orange element on screen. It's always obvious what to do next.
- **Skills shortcut** -- bottom bar lets founder inject a specific skill mid-conversation. Small lightning bolt icon.
- **No avatar for AI.** The gradient border IS the identity. Avatars feel like support chat.
- **Typing indicator** -- three dots with the ignite gradient shimmer, not generic gray.

**Mobile:** Full-screen chat. Bottom bar collapses to just input + send. Skills accessible via swipe-up drawer.

### Screen 3: LAUNCH WIZARD (Guided Flow)

**Goal:** Step-by-step when the founder wants structure over conversation.

**Layout:**
```
┌──────────────────────────────────────────────────┐
│  LAUNCH WIZARD                                   │
│                                                  │
│  ● ── ● ── ◐ ── ○ ── ○ ── ○ ── ○               │
│  Prep  Token  Pool  Trust  Community  Growth  Go │
│  (progress bar using ignite gradient fill)        │
│                                                  │
├──────────────────────────────────────────────────┤
│                                                  │
│  STEP 3: POOL CONFIGURATION                      │
│  (all-caps, wide-tracked, text-secondary)        │
│                                                  │
│  ┌────────────────────┐ ┌────────────────────┐   │
│  │  POOL TYPE         │ │  RECOMMENDED       │   │
│  │                    │ │                    │   │
│  │  ◉ DLMM           │ │  Based on your     │   │
│  │  ○ DBC             │ │  token profile:    │   │
│  │  ○ DAMM v2         │ │                    │   │
│  │                    │ │  DLMM with 5 bps   │   │
│  │  (radio cards)     │ │  bin step, 0.5%    │   │
│  │                    │ │  base fee           │   │
│  └────────────────────┘ └────────────────────┘   │
│                                                  │
│  ┌────────────────────────────────────────────┐  │
│  │  BIN STEP: [====●==========] 5 bps        │  │
│  │  BASE FEE: [===●===========] 0.5%         │  │
│  │  INITIAL LIQUIDITY: [$________] SOL       │  │
│  └────────────────────────────────────────────┘  │
│                                                  │
│  ┌────────────────────────────────────────────┐  │
│  │  💡 Why this config?                       │  │
│  │  "5 bps gives tight spreads for utility    │  │
│  │   tokens with steady volume. Higher bin    │  │
│  │   steps suit volatile meme tokens."        │  │
│  └────────────────────────────────────────────┘  │
│  (explainer card, container-secondary bg,        │
│   purple-tint left border)                       │
│                                                  │
│       [← Back]              [Continue →]         │
│       (ghost btn)           (orange CTA)         │
└──────────────────────────────────────────────────┘
```

**Key design decisions:**

- **Two-column on desktop** -- config on left, AI recommendation on right. Single column on mobile.
- **"Why this config?" explainers** -- every recommendation has a collapsible explanation. Founders learn while building.
- **Progress dots, not a numbered stepper** -- feels lighter. Gradient fill shows how far along.
- **The AI can interject** -- if the founder picks a config that conflicts with their goals, an inline warning appears (danger red border, clear explanation).
- **Continue button is always orange.** Back button is ghost (border only, text-secondary).

### Screen 4: DASHBOARD (Mission Control)

**Goal:** At-a-glance launch health. Come back daily.

**Layout:**
```
┌──────────────────────────────────────────────────┐
│  [MetIgnite]   Dashboard   Chat   Skills         │
├──────────────────────────────────────────────────┤
│                                                  │
│  ┌─ LAUNCH READINESS ────────────────────────┐   │
│  │         ◉ 78/100                          │   │
│  │    (large ring, ignite gradient,          │   │
│  │     number in center, animates on load)   │   │
│  │                                           │   │
│  │  ● What to do next:                       │   │
│  │  → Set up LP lock (Trust +15)  [Do it]   │   │
│  │  → Draft launch thread         [Do it]   │   │
│  │  (pulsing orange dot on first item)       │   │
│  └───────────────────────────────────────────┘   │
│                                                  │
│  ┌──────────────┐  ┌──────────────┐              │
│  │ POOL HEALTH  │  │ COMMUNITY    │              │
│  │              │  │              │              │
│  │ TVL: $24.5K  │  │ TG: 847      │              │
│  │ Vol: $8.2K   │  │ Twitter: 1.2K│              │
│  │ Fees: $41    │  │ Holders: 234 │              │
│  │ (24h)        │  │              │              │
│  │              │  │              │              │
│  │ [sparkline]  │  │ [sparkline]  │              │
│  └──────────────┘  └──────────────┘              │
│  (2-col max for metric cards)                    │
│                                                  │
│  ┌─ TIMELINE ────────────────────────────────┐   │
│  │                                           │   │
│  │  Apr 1  ✅ Tokenomics reviewed            │   │
│  │  Apr 2  ✅ Pool configured (DLMM, 5bps)  │   │
│  │  Apr 3  ✅ LP lock set (6 months)         │   │
│  │  Apr 4  ● Draft launch thread  ← YOU ARE │   │
│  │  Apr 5  ○ Community soft launch           │   │
│  │  Apr 7  ○ Token launch day               │   │
│  │                                           │   │
│  │  (vertical timeline, gradient line,       │   │
│  │   current step has pulsing orange dot)    │   │
│  └───────────────────────────────────────────┘   │
│                                                  │
└──────────────────────────────────────────────────┘
```

**Key design decisions:**

- **Readiness score dominates** -- it's the single number that matters. Large, animated, gradient-filled ring.
- **"What to do next" is always visible** -- orange [Do it] buttons. One tap goes to the right skill/chat context.
- **2-column metric cards** -- max. Never 3. Stays readable on mobile.
- **Sparklines, not full charts** -- dashboard is for vibes and direction, not deep analysis. Link to detailed view for data nerds.
- **Timeline is vertical** -- reads like a story. Current position has the pulsing orange dot. Past = green checks. Future = hollow dots.
- **All numbers use JetBrains Mono.** Aligns neatly, feels like real data.

**Mobile:** Single column. Readiness score card becomes a sticky header showing just the number. Cards stack vertically.

### Screen 5: SKILLS MARKETPLACE

**Goal:** Browse capabilities, import what you need.

**Layout:**
```
┌──────────────────────────────────────────────────┐
│  SKILLS                    [Search skills...]    │
│                                                  │
│  ALL  LAUNCH  LIQUIDITY  GROWTH  COMMUNITY       │
│  (pill tabs, active = orange fill)               │
│                                                  │
│  ┌──────────────────────┐ ┌──────────────────┐   │
│  │  ⚡ IGNITE-PREP      │ │  ⚡ IGNITE-TOKEN │   │
│  │                      │ │                  │   │
│  │  Pre-launch          │ │  Tokenomics      │   │
│  │  readiness check.    │ │  review and      │   │
│  │  7 dimensions,       │ │  benchmarking.   │   │
│  │  scored.             │ │                  │   │
│  │                      │ │                  │   │
│  │  Used by 34 founders │ │  Used by 28      │   │
│  │                      │ │  founders        │   │
│  │  [Import Skill]      │ │  [Import Skill]  │   │
│  └──────────────────────┘ └──────────────────┘   │
│                                                  │
│  ┌──────────────────────┐ ┌──────────────────┐   │
│  │  ⚡ IGNITE-LIQUIDITY │ │  ⚡ IGNITE-GROWTH│   │
│  │                      │ │                  │   │
│  │  DLMM pool config.   │ │  Growth engine   │   │
│  │  Bin step, fee tier,  │ │  with ICE        │   │
│  │  position strategy.  │ │  scoring.        │   │
│  │                      │ │                  │   │
│  │  Used by 31 founders │ │  Used by 19      │   │
│  │                      │ │  founders        │   │
│  │  [Import Skill]      │ │  [Import Skill]  │   │
│  └──────────────────────┘ └──────────────────┘   │
│                                                  │
│  ┌─ BUILD YOUR OWN ─────────────────────────┐    │
│  │  Create custom skills for your launch.   │    │
│  │  [Learn How →]                           │    │
│  └──────────────────────────────────────────┘    │
│  (subtle card, purple-tint bg, no border)        │
└──────────────────────────────────────────────────┘
```

**Key design decisions:**

- **2-column grid** for skill cards. Each card: icon, name (all-caps), description, social proof, CTA.
- **Lightning bolt icon (⚡)** is the universal skill symbol. Orange tint.
- **Filter pills** -- horizontal scroll on mobile. Active pill is orange fill, rest are ghost.
- **[Import Skill] is orange.** Always. Every card has one clear action.
- **"Build Your Own" CTA** at bottom -- subtle, not competing with the import buttons. Purple tint background to differentiate from skill cards.
- **No star ratings, no reviews.** Usage count only. Simple social proof.

---

## 3. INTERACTION PATTERNS

### Transitions
- **Page to page:** Fade + subtle slide (200ms ease-out). Never hard cuts.
- **Cards appearing:** Staggered fade-in-slide-up (50ms delay between cards).
- **Score ring filling:** Animated on viewport entry, 800ms with ease-out. Number counts up.
- **Chat messages:** Slide in from bottom (user) or fade in from left (AI). 150ms.

### Microinteractions
- **Orange CTA hover:** Scale 1.02, shadow glow (orange, 20% opacity, 20px blur). 150ms.
- **Card hover:** Subtle tilt (1-2 degrees), border transitions from border-secondary to border-primary. 200ms.
- **Input focus:** Orange glow intensifies. Border transitions to accent-400.
- **Pulsing dot:** 2s infinite, opacity 0.4 to 1.0. Draws the eye to "what's next."
- **Confetti burst:** On reaching 100/100 readiness score. One-time celebration.
- **Pool deployment celebration:** THE moment. When pool is deployed on-chain: full-screen ignite gradient flash (200ms), confetti burst from center (3s duration, orange + purple + gold particles), readiness ring pulses and transforms into a checkmark, "Your pool is live" text fades in with point-text gradient. Sound cue if audio enabled. This is the payoff moment -- make it memorable.

### Loading States
- **Skeleton screens** -- not spinners. Cards show animated gradient shimmer (dark to slightly lighter, left to right sweep).
- **AI thinking** -- three dots with ignite gradient shimmer. Below: "Running ignite-prep..." in text-tertiary + mono font.
- **Data fetching** -- sparklines show shimmer placeholder, snap to real data with a quick fade.

---

## 4. MOBILE CONSIDERATIONS

### Priorities
1. Chat is the primary mobile experience. Full-screen, bottom-anchored input.
2. Dashboard is a daily check-in. Readiness score sticky at top, cards scroll below.
3. Wizard works as single-column. One question per screen on small devices.
4. Skills marketplace is browse-and-import. Single column cards.

### Navigation
- **Bottom tab bar** on mobile: Chat | Dashboard | Skills | Settings
- 4 items max. Icons + labels. Active tab = orange icon.
- No hamburger menu. Everything accessible from the bottom bar.

### Touch Targets
- Minimum 44x44px tap targets.
- Cards have full-surface tap (not just the button).
- Swipe gestures: left on a "to-do" item to dismiss/snooze.

---

## 5. WHAT THIS IS NOT

- **Not a generic dashboard template.** Every element serves the launch journey.
- **Not a chatbot skin.** The chat has rich inline cards, not just text bubbles.
- **Not overwhelming.** Maximum 2 columns. Maximum 3 capability cards. Maximum 5 "to-do" items visible. The AI prioritizes, the UI reflects that focus.
- **Not a dark theme slapped on Bootstrap.** This is Meteora's visual language -- grain textures, atmospheric purple, decisive orange, generous space.

---

## 6. COMPONENT NEEDS (for galatea)

Components we need that exist in the design system:
- Button (primary/ghost/danger variants)
- Card (with gradient border variant)
- Badge (status indicators)
- Input (with glow focus state)

Components we need to build:
- **ChatMessage** -- AI vs user variants, supports inline rich cards
- **ReadinessRing** -- Circular progress with gradient fill, animated
- **ProgressDots** -- Horizontal step indicator with gradient fill
- **SkillCard** -- Standardized card for skills marketplace
- **MetricCard** -- Number + label + sparkline
- **Timeline** -- Vertical with status dots (complete/current/future)
- **PulsingDot** -- Reusable attention indicator
- **FilterPills** -- Horizontal scrollable filter bar
- **BottomTabBar** -- Mobile navigation

---

## 7. OPEN DESIGN QUESTIONS (for ophelia)

1. **Onboarding: wallet-first or chat-first?** Current wireframe is chat-first (type before connecting). Could gate behind wallet connect for personalization. Recommendation: chat-first, wallet optional until pool setup.

2. **Readiness score: public or private?** If public/shareable, we need an OG image generator for scores. Could be powerful social proof ("I scored 92/100 on MetIgnite"). Adds scope.

3. **Skills marketplace: separate page or tab within dashboard?** Current wireframe has it as a separate top-level nav item. Could be a drawer/panel within the chat. Recommendation: separate page -- it's a discovery experience, not a utility.

4. **Branding: "MetIgnite" or "Meteora Ignite"?** Affects logo treatment, URL structure, and how much Meteora branding is visible. Spec recommends Meteora-branded.

5. **Data viz patterns: coordinate with atlas?** Dashboard metrics and sparklines need a shared visual language with any other data viz atlas produces.

---

*This brief is ready for review. No high-fi work until ophelia approves direction.*
