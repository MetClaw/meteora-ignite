import type { ComplianceResult, SkillResponse } from "./skills/types";

interface ProhibitedPhrase {
  pattern: RegExp;
  reason: string;
  replacement: string;
}

const PROHIBITED_PHRASES: ProhibitedPhrase[] = [
  {
    pattern: /guaranteed\s+returns?/gi,
    reason: "Implies financial guarantee",
    replacement: "potential returns",
  },
  {
    pattern: /investment\s+opportunit/gi,
    reason: "Securities language",
    replacement: "participation opportunity",
  },
  {
    pattern: /risk[- ]free/gi,
    reason: "No DeFi activity is risk-free",
    replacement: "with managed risk",
  },
  {
    pattern: /can('t|\s+not)\s+lose/gi,
    reason: "Implies no downside risk",
    replacement: "with risk management",
  },
  {
    pattern: /100%\s+safe/gi,
    reason: "Nothing in DeFi is 100% safe",
    replacement: "designed for security",
  },
  {
    pattern: /financial\s+advice/gi,
    reason: "We do not provide financial advice",
    replacement: "educational information",
  },
  {
    pattern: /sure\s+thing|sure\s+bet/gi,
    reason: "Implies certainty of returns",
    replacement: "strong opportunity",
  },
  {
    pattern: /\bto\s+the\s+moon\b/gi,
    reason: "Price prediction language",
    replacement: "growth potential",
  },
];

function scanText(text: string): ComplianceResult {
  const violations: ComplianceResult["violations"] = [];
  let cleanedText = text;

  for (const rule of PROHIBITED_PHRASES) {
    const matches = text.match(rule.pattern);
    if (matches) {
      for (const match of matches) {
        violations.push({
          phrase: match,
          reason: rule.reason,
          replacement: rule.replacement,
        });
      }
      cleanedText = cleanedText.replace(rule.pattern, rule.replacement);
    }
  }

  return {
    passed: violations.length === 0,
    originalText: text,
    cleanedText,
    violations,
  };
}

// JSON-compatible value type for recursive compliance scanning
type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };
type JsonObject = { [key: string]: JsonValue };

function scanObject(obj: JsonObject): JsonObject {
  const result: JsonObject = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      const scanned = scanText(value);
      result[key] = scanned.cleanedText;
    } else if (Array.isArray(value)) {
      result[key] = value.map((item) =>
        typeof item === "object" && item !== null && !Array.isArray(item)
          ? scanObject(item as JsonObject)
          : typeof item === "string"
            ? scanText(item).cleanedText
            : item
      );
    } else if (typeof value === "object" && value !== null) {
      result[key] = scanObject(value as JsonObject);
    } else {
      result[key] = value;
    }
  }
  return result;
}

const CONTENT_SKILLS = new Set([
  "content-draft",
  "community-setup",
  "outreach",
  "growth-playbook",
]);

export function complianceMiddleware(response: SkillResponse): SkillResponse {
  if (!CONTENT_SKILLS.has(response.skillId)) {
    return response;
  }

  const summaryResult = scanText(response.summary);
  // Skill output data is JSON-serializable, so casting through JsonObject is safe
  const cleanedData = scanObject(response.data as unknown as JsonObject);

  return {
    ...response,
    summary: summaryResult.cleanedText,
    data: cleanedData as unknown as SkillResponse["data"],
  };
}
