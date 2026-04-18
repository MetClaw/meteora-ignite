import { createSkillRoute } from "@/lib/skill-route-handler";
import { executeCrisisResponse } from "@/lib/skills/crisis-response";

export const POST = createSkillRoute(executeCrisisResponse, { compliance: true });
