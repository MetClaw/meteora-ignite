"use client";

import type { AnySkillOutput } from "@/lib/skills/types";

// JSON-compatible value types for the recursive renderer
type JsonPrimitive = string | number | boolean | null | undefined;
type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };
type JsonObject = { [key: string]: JsonValue };

interface FallbackCardProps {
  data: AnySkillOutput;
  title?: string;
}

function renderValue(value: JsonValue, depth: number = 0): React.ReactNode {
  if (value === null || value === undefined) return "--";
  if (typeof value === "number") return value.toLocaleString();
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "string") return value;

  // Render arrays of objects as mini-tables
  if (Array.isArray(value)) {
    if (value.length === 0) return "None";

    // Array of strings
    if (typeof value[0] === "string") {
      return (
        <ul className="space-y-0.5">
          {value.map((v, i) => (
            <li key={i} className="text-[11px] text-met-text-secondary flex gap-1.5">
              <span className="text-met-text-tertiary shrink-0">--</span>
              {String(v)}
            </li>
          ))}
        </ul>
      );
    }

    // Array of objects -- render as stacked cards (max depth 1)
    if (typeof value[0] === "object" && depth < 2) {
      return (
        <div className="space-y-1.5 mt-1">
          {value.slice(0, 10).map((item, i) => (
            <div key={i} className="p-2 rounded bg-met-base-deep/50 border border-met-stroke/50">
              {Object.entries(item as JsonObject)
                .filter(([k]) => !k.startsWith("_"))
                .map(([k, v]) => (
                  <div key={k} className="flex items-start gap-2 text-[10px] py-0.5">
                    <span className="text-met-text-tertiary w-24 shrink-0 capitalize">
                      {k.replace(/([A-Z])/g, " $1").trim()}
                    </span>
                    <span className="text-met-text-secondary flex-1 break-words">
                      {typeof v === "object" && v !== null
                        ? JSON.stringify(v)
                        : String(v ?? "--")}
                    </span>
                  </div>
                ))}
            </div>
          ))}
          {value.length > 10 && (
            <span className="text-[10px] text-met-text-tertiary">
              +{value.length - 10} more items
            </span>
          )}
        </div>
      );
    }

    return value.map(String).join(", ");
  }

  // Nested objects -- render as a section (max depth 1)
  if (typeof value === "object" && depth < 2) {
    return (
      <div className="mt-1 space-y-1">
        {Object.entries(value as JsonObject)
          .filter(([k]) => !k.startsWith("_"))
          .map(([k, v]) => (
            <div key={k} className="flex items-start gap-2 text-[10px]">
              <span className="text-met-text-tertiary w-24 shrink-0 capitalize">
                {k.replace(/([A-Z])/g, " $1").trim()}
              </span>
              <span className="text-met-text-secondary flex-1 break-words">
                {renderValue(v, depth + 1)}
              </span>
            </div>
          ))}
      </div>
    );
  }

  return JSON.stringify(value);
}

export function FallbackCard({ data, title }: FallbackCardProps) {
  const entries = Object.entries(data).filter(
    ([key]) => !key.startsWith("_") && key !== "cardType"
  );

  return (
    <div className="space-y-3">
      {title && (
        <span className="text-xs text-met-text-tertiary block capitalize">
          {title.replace(/-/g, " ")}
        </span>
      )}
      {entries.map(([key, value]) => {
        const isComplex = typeof value === "object" && value !== null;
        return (
          <div key={key} className={isComplex ? "p-3 rounded-lg bg-met-base-dark border border-met-stroke" : ""}>
            <div className={isComplex ? "" : "flex items-start gap-2 text-xs"}>
              <span className={`text-met-text-tertiary capitalize font-medium ${isComplex ? "text-[10px] tracking-wide block mb-1.5" : "w-28 shrink-0 text-xs"}`}>
                {key.replace(/([A-Z])/g, " $1").trim()}
              </span>
              <span className={isComplex ? "" : "text-met-text-secondary flex-1 break-words text-xs"}>
                {renderValue(value, 0)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
