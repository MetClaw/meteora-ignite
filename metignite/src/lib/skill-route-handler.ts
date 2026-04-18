// Shared factory for skill API route handlers.
// All 17 skill routes follow the same pattern:
//   1. Parse request body
//   2. Rate-limit by session (if sessionId present)
//   3. Execute the skill
//   4. Optionally run compliance middleware
//   5. Return JSON with rate-limit headers
//
// Usage in a route file:
//   import { createSkillRoute } from "@/lib/skill-route-handler";
//   import { executePoolSetup } from "@/lib/skills/pool-setup";
//   export const POST = createSkillRoute(executePoolSetup, { compliance: true });

import { checkRateLimit } from "@/lib/rate-limiter";
import { complianceMiddleware } from "@/lib/compliance";
import type { SkillRequest, SkillExecutor } from "@/lib/skills/types";

interface SkillRouteOptions {
  /** Whether to run compliance scanning on the result. Default: false */
  compliance?: boolean;
}

export function createSkillRoute(
  executor: SkillExecutor,
  options: SkillRouteOptions = {}
) {
  const { compliance = false } = options;

  return async function POST(request: Request) {
    try {
      const body: SkillRequest = await request.json();
      const { params, context, sessionId } = body;

      // Rate-limit check (only when sessionId is provided)
      let rateLimitHeaders: Record<string, string> | undefined;
      if (sessionId) {
        const limit = checkRateLimit(sessionId);
        if (!limit.allowed) {
          return Response.json(
            {
              error: "Rate limit exceeded. 50 skill calls per session per day.",
              resetAt: new Date(limit.resetAt).toISOString(),
            },
            {
              status: 429,
              headers: {
                "X-RateLimit-Remaining": "0",
                "X-RateLimit-Reset": String(limit.resetAt),
              },
            }
          );
        }
        rateLimitHeaders = {
          "X-RateLimit-Remaining": String(limit.remaining),
          "X-RateLimit-Reset": String(limit.resetAt),
        };
      }

      let result = await executor(params, context);
      if (compliance) result = complianceMiddleware(result);

      return Response.json(result, rateLimitHeaders ? { headers: rateLimitHeaders } : undefined);
    } catch (error) {
      return Response.json(
        {
          error: "Internal error executing skill.",
          detail: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  };
}
