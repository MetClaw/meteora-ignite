"use client";

import { motion } from "framer-motion";

interface ScoreDimension {
  name: string;
  score: number;
  assessment?: string;
  recommendation?: string;
}

interface ScoreCardProps {
  score: number;
  maxScore?: number;
  verdict?: string;
  dimensions: ScoreDimension[];
  redFlags?: string[];
  size?: "sm" | "lg";
}

function ScoreRing({
  score,
  maxScore = 100,
  size = "sm",
}: {
  score: number;
  maxScore?: number;
  size?: "sm" | "lg";
}) {
  const pct = (score / maxScore) * 100;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  const verdictTextColor =
    pct >= 80
      ? "text-met-success"
      : pct >= 40
        ? "text-met-warning"
        : "text-met-danger";

  const sizeClass = size === "lg" ? "w-40 h-40" : "w-12 h-12";
  const numberClass = size === "lg" ? "text-3xl font-bold" : "text-sm font-bold";
  const subClass = size === "lg" ? "text-xs" : "text-[8px]";

  return (
    <div className={`relative ${sizeClass} shrink-0`}>
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <defs>
          <linearGradient id="ignite-ring" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f7c10b" />
            <stop offset="50%" stopColor="#f84c00" />
            <stop offset="100%" stopColor="#5f33ff" />
          </linearGradient>
        </defs>
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="var(--color-met-base-dark)"
          strokeWidth="6"
        />
        <motion.circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="url(#ignite-ring)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`${numberClass} ${verdictTextColor}`}>{score}</span>
        <span className={`${subClass} text-met-text-tertiary`}>
          /{maxScore}
        </span>
      </div>
    </div>
  );
}

export function ScoreCard({
  score,
  maxScore = 100,
  verdict,
  dimensions,
  redFlags,
  size = "sm",
}: ScoreCardProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <ScoreRing score={score} maxScore={maxScore} size={size} />
        <div className="flex-1 space-y-1.5">
          {verdict && (
            <span className="text-xs font-medium uppercase tracking-wider text-met-text-tertiary">
              {verdict}
            </span>
          )}
          {dimensions.map((dim) => (
            <div key={dim.name} className="flex items-center gap-2">
              <span className="text-xs text-met-text-tertiary w-28 shrink-0 truncate">
                {dim.name}
              </span>
              <div className="flex-1 h-1.5 bg-met-base-dark rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${
                    dim.score >= 70
                      ? "bg-met-success"
                      : dim.score >= 50
                        ? "bg-met-warning"
                        : "bg-met-danger"
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${dim.score}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
              </div>
              <span className="text-xs font-medium w-7 text-right tabular-nums">
                {dim.score}
              </span>
            </div>
          ))}
        </div>
      </div>

      {redFlags && redFlags.length > 0 && (
        <div className="border-t border-met-stroke pt-3">
          <span className="text-xs text-met-danger font-medium block mb-2">
            Red Flags
          </span>
          <ul className="space-y-1">
            {redFlags.map((flag, i) => (
              <li
                key={i}
                className="text-xs text-met-text-secondary flex gap-2"
              >
                <span className="text-met-danger shrink-0">!</span>
                {flag}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
