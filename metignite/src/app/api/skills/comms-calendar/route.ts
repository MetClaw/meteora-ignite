import { createSkillRoute } from "@/lib/skill-route-handler";
import { executeCommsCalendar } from "@/lib/skills/comms-calendar";

export const POST = createSkillRoute(executeCommsCalendar, { compliance: true });
