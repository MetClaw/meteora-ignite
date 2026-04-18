"use client";

import { Badge } from "@/components/ui/Badge";
import type { PoolSetupOutput } from "@/lib/skills/types";

interface PoolRecommendationCardProps {
  data: PoolSetupOutput;
}

export function PoolRecommendationCard({ data }: PoolRecommendationCardProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <span className="text-xs text-met-text-tertiary">Pool Type</span>
          <p className="text-sm font-semibold text-met-accent-400">
            {data.recommendedPool}
          </p>
        </div>
        <div className="space-y-1">
          <span className="text-xs text-met-text-tertiary">Strategy</span>
          <p className="text-sm font-medium">{data.positionStrategy}</p>
        </div>
        <div className="space-y-1">
          <span className="text-xs text-met-text-tertiary">Bin Step</span>
          <p className="text-sm font-medium">{data.binStep}</p>
        </div>
        <div className="space-y-1">
          <span className="text-xs text-met-text-tertiary">Base Fee</span>
          <p className="text-sm font-medium">{data.baseFee}bp</p>
        </div>
      </div>

      <div className="border-t border-met-stroke pt-3">
        <span className="text-xs text-met-text-tertiary block mb-2">
          Estimated Fees
        </span>
        <div className="grid grid-cols-3 gap-2">
          {(["daily", "monthly", "annual"] as const).map((period) => (
            <div
              key={period}
              className="text-center p-2 bg-met-base-dark rounded-[8px]"
            >
              <p className="text-xs text-met-text-tertiary capitalize">
                {period}
              </p>
              <p className="text-sm font-semibold text-met-success tabular-nums">
                ${data.estimatedFees[period].toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      {data.comparisons.length > 0 && (
        <div className="border-t border-met-stroke pt-3">
          <span className="text-xs text-met-text-tertiary block mb-2">
            Alternatives
          </span>
          <div className="space-y-2">
            {data.comparisons.map((comp) => (
              <div
                key={comp.poolType}
                className="flex items-start gap-3 text-xs"
              >
                <Badge size="sm" variant="default">
                  {comp.poolType}
                </Badge>
                <span className="text-met-text-secondary flex-1">
                  {comp.tradeoffs}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
