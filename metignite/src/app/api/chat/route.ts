import Anthropic from "@anthropic-ai/sdk";
import type { FounderContext } from "@/lib/skills/types";

const SYSTEM_PROMPT = `You are MetIgnite, an AI launch companion for founders building on Meteora (Solana's leading liquidity protocol).

Your role:
- Help founders prepare for a successful token launch on Meteora
- Explain Meteora pool types (DLMM, DAMM v2, DBC) and when to use each
- Guide tokenomics design, community building, and launch strategy
- Be direct, practical, and web3-native. No fluff.

Key Meteora facts:
- DLMM (Dynamic Liquidity Market Maker): Best for active LPs. Concentrated liquidity with bins. Highest fee potential but requires active management.
- DAMM v2 (Dynamic AMM): Best for stable/correlated pairs. Lower maintenance. Good for LSTs and stablecoins.
- DBC (Dynamic Bonding Curve): Best for new token launches. Automated price discovery. Simple setup. Most founders start here.
- Meteora processed $182.2B total volume, $1.31B in fees, $1.19B returned to LPs.
- 84% of Solana token launches get sniped within 5 seconds.
- 98.6% of launchpad tokens fail.

Rules:
- Never give financial advice or guarantee returns
- Never recommend specific token purchases
- Always recommend LP locks and vesting for team tokens
- Use -- instead of em dashes
- Be concise. Lead with the answer.`;

function buildContextBlock(context: FounderContext): string {
  return `
FOUNDER'S PROJECT:
- Name: ${context.projectName}
- Description: ${context.projectDescription}
- Asset Type: ${context.assetType}
- Budget: ${context.budget}
- Team Size: ${context.teamSize} (${context.isDoxxed ? "doxxed" : "anonymous"})
- Community: ${context.existingCommunitySize} members
- Goal: ${context.primaryGoal}
- Phase: ${context.currentPhase}
- Completed Skills: ${Object.keys(context.completedSkills || {}).join(", ") || "none yet"}

Personalize all responses to this project.`;
}

export async function POST(request: Request) {
  try {
    const { messages, context } = await request.json();

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      // Fallback response when no API key is configured
      return Response.json({
        role: "assistant",
        content: "Claude API is not configured yet. Add your ANTHROPIC_API_KEY to .env.local to enable conversational chat. In the meantime, try running a skill -- type something like \"review my tokenomics\" or \"configure my pool\".",
      });
    }

    const client = new Anthropic({ apiKey });

    const systemPrompt = context
      ? `${SYSTEM_PROMPT}\n\n${buildContextBlock(context)}`
      : SYSTEM_PROMPT;

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    });

    const text = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("");

    return Response.json({
      role: "assistant",
      content: text,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return Response.json(
      { error: "Failed to generate response", detail: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}
