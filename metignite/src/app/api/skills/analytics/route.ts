import { createSkillRoute } from "@/lib/skill-route-handler";
import { executeAnalytics } from "@/lib/skills/analytics";

export const POST = createSkillRoute(executeAnalytics);
