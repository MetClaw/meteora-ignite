import { createSkillRoute } from "@/lib/skill-route-handler";
import { executeTrustScore } from "@/lib/skills/trust-score";

export const POST = createSkillRoute(executeTrustScore);
