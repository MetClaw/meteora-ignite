import { createSkillRoute } from "@/lib/skill-route-handler";
import { executeLaunchSequence } from "@/lib/skills/launch-sequence";

export const POST = createSkillRoute(executeLaunchSequence, { compliance: true });
