"use client";

import { motion } from "framer-motion";

interface ChecklistItem {
  label: string;
  status: "done" | "in-progress" | "pending" | "blocked";
  detail?: string;
}

interface ChecklistCardProps {
  title?: string;
  items: ChecklistItem[];
}

const STATUS_STYLES: Record<
  ChecklistItem["status"],
  { icon: string; ring: string; text: string }
> = {
  done: {
    icon: "\u2713",
    ring: "border-met-success bg-met-success/10 text-met-success",
    text: "text-met-text-secondary line-through",
  },
  "in-progress": {
    icon: "\u25B6",
    ring: "border-met-accent-400 bg-met-accent-400/10 text-met-accent-400",
    text: "text-met-text-primary",
  },
  pending: {
    icon: "",
    ring: "border-met-stroke bg-transparent",
    text: "text-met-text-tertiary",
  },
  blocked: {
    icon: "!",
    ring: "border-met-danger bg-met-danger/10 text-met-danger",
    text: "text-met-danger",
  },
};

export function ChecklistCard({ title, items }: ChecklistCardProps) {
  const doneCount = items.filter((i) => i.status === "done").length;

  return (
    <div className="space-y-3">
      {title && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-met-text-tertiary">{title}</span>
          <span className="text-xs text-met-text-tertiary tabular-nums">
            {doneCount}/{items.length}
          </span>
        </div>
      )}

      {/* Progress bar */}
      <div className="h-1 bg-met-base-dark rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-met-success rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${(doneCount / items.length) * 100}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>

      <ul className="space-y-2">
        {items.map((item, i) => {
          const style = STATUS_STYLES[item.status];
          return (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-start gap-2.5"
            >
              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 text-[10px] font-bold ${style.ring}`}
              >
                {style.icon}
              </div>
              <div className="flex-1 min-w-0">
                <span className={`text-xs ${style.text}`}>{item.label}</span>
                {item.detail && (
                  <p className="text-[10px] text-met-text-tertiary mt-0.5">
                    {item.detail}
                  </p>
                )}
              </div>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}
