import { createSkillRoute } from "@/lib/skill-route-handler";
import { executePostLaunchMonitor } from "@/lib/skills/post-launch-monitor";

export const POST = createSkillRoute(executePostLaunchMonitor);
