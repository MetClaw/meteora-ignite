import { createSkillRoute } from "@/lib/skill-route-handler";
import { executeBuybackReporter } from "@/lib/skills/buyback-reporter";

export const POST = createSkillRoute(executeBuybackReporter, { compliance: true });
