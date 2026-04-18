import { createSkillRoute } from "@/lib/skill-route-handler";
import { executeContentDraft } from "@/lib/skills/content-draft";

export const POST = createSkillRoute(executeContentDraft, { compliance: true });
