"use client";

import { useState, useMemo, useCallback } from "react";

const POOLS = [
  { pair: "SOL/USDC", binStep: 1, dailyVolume: 85_000_000, tvl: 12_000_000, feeRate: 0.0001 },
  { pair: "SOL/USDC", binStep: 2, dailyVolume: 120_000_000, tvl: 18_000_000, feeRate: 0.0002 },
  { pair: "SOL/USDC", binStep: 5, dailyVolume: 65_000_000, tvl: 8_000_000, feeRate: 0.0005 },
  { pair: "SOL/USDT", binStep: 2, dailyVolume: 45_000_000, tvl: 6_500_000, feeRate: 0.0002 },
  { pair: "SOL/USDT", binStep: 5, dailyVolume: 32_000_000, tvl: 4_200_000, feeRate: 0.0005 },
  { pair: "JUP/SOL", binStep: 10, dailyVolume: 18_000_000, tvl: 2_800_000, feeRate: 0.001 },
  { pair: "JUP/USDC", binStep: 10, dailyVolume: 12_000_000, tvl: 1_900_000, feeRate: 0.001 },
  { pair: "WIF/SOL", binStep: 20, dailyVolume: 22_000_000, tvl: 3_100_000, feeRate: 0.002 },
  { pair: "BONK/SOL", binStep: 20, dailyVolume: 15_000_000, tvl: 2_200_000, feeRate: 0.002 },
  { pair: "JTO/SOL", binStep: 10, dailyVolume: 8_500_000, tvl: 1_400_000, feeRate: 0.001 },
  { pair: "PYTH/SOL", binStep: 10, dailyVolume: 6_200_000, tvl: 950_000, feeRate: 0.001 },
  { pair: "RAY/SOL", binStep: 10, dailyVolume: 5_800_000, tvl: 1_100_000, feeRate: 0.001 },
] as const;

const TIME_OPTIONS = [
  { label: "1D", days: 1 },
  { label: "7D", days: 7 },
  { label: "30D", days: 30 },
  { label: "90D", days: 90 },
  { label: "1Y", days: 365 },
];

const STANDARD_AMM_APR = 0.12; // 12% baseline for comparison

function fmt(n: number, decimals = 2): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(decimals)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(decimals)}K`;
  return `$${n.toFixed(decimals)}`;
}

function fmtPct(n: number): string {
  return `${n.toFixed(2)}%`;
}

function fmtNumber(n: number): string {
  return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

function SliderInput({
  label,
  value,
  onChange,
  min,
  max,
  step,
  format,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium uppercase tracking-wider text-met-text-sec">
          {label}
        </label>
        <span className="text-sm font-semibold text-met-text tabular-nums">
          {format(value)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
      />
      <div className="flex justify-between text-[10px] text-met-text-ter">
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>
    </div>
  );
}

function ResultCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-met border border-met-stroke bg-met-container p-4 transition-all duration-200 hover:border-met-stroke-active hover:shadow-met-hover">
      <p className="text-[10px] font-medium uppercase tracking-wider text-met-text-ter mb-1">
        {label}
      </p>
      <p
        className={`text-2xl font-bold tabular-nums animate-count-up ${
          accent ? "text-gradient-meteora" : "text-met-text"
        }`}
      >
        {value}
      </p>
      {sub && (
        <p className="text-xs text-met-text-sec mt-1 tabular-nums">{sub}</p>
      )}
    </div>
  );
}

function ComparisonBar({
  dlmmYield,
  ammYield,
}: {
  dlmmYield: number;
  ammYield: number;
}) {
  const maxVal = Math.max(dlmmYield, ammYield, 1);
  const dlmmWidth = Math.min((dlmmYield / maxVal) * 100, 100);
  const ammWidth = Math.min((ammYield / maxVal) * 100, 100);
  const multiplier = ammYield > 0 ? (dlmmYield / ammYield).toFixed(1) : "---";

  return (
    <div className="rounded-met border border-met-stroke bg-met-container p-4 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-medium uppercase tracking-wider text-met-text-ter">
          DLMM vs Standard AMM
        </p>
        <span className="text-xs font-bold text-met-success">{multiplier}x</span>
      </div>

      <div className="space-y-3">
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-met-primary-500 font-medium">Meteora DLMM</span>
            <span className="text-met-text tabular-nums font-semibold">
              {fmtPct(dlmmYield)}
            </span>
          </div>
          <div className="h-3 rounded-full bg-met-base-1 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${dlmmWidth}%`,
                background: "linear-gradient(90deg, #6e45ff, #f54b00)",
              }}
            />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-met-text-ter font-medium">Standard AMM</span>
            <span className="text-met-text-ter tabular-nums font-semibold">
              {fmtPct(ammYield)}
            </span>
          </div>
          <div className="h-3 rounded-full bg-met-base-1 overflow-hidden">
            <div
              className="h-full rounded-full bg-met-text-disabled transition-all duration-500 ease-out"
              style={{ width: `${ammWidth}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [deposit, setDeposit] = useState(10_000);
  const [selectedPoolIndex, setSelectedPoolIndex] = useState(1);
  const [timePeriodIndex, setTimePeriodIndex] = useState(2); // 30D default

  const pool = POOLS[selectedPoolIndex];
  const timePeriod = TIME_OPTIONS[timePeriodIndex];

  // Unique pairs for the selector
  const uniquePairs = useMemo(() => {
    const seen = new Set<string>();
    return POOLS.reduce<string[]>((acc, p) => {
      if (!seen.has(p.pair)) {
        seen.add(p.pair);
        acc.push(p.pair);
      }
      return acc;
    }, []);
  }, []);

  const selectedPair = pool.pair;

  // Pools matching selected pair
  const matchingPools = useMemo(
    () => POOLS.map((p, i) => ({ ...p, index: i })).filter((p) => p.pair === selectedPair),
    [selectedPair]
  );

  // Fee calculation
  const calc = useMemo(() => {
    const shareOfPool = deposit / (pool.tvl + deposit);
    const dailyFees = pool.dailyVolume * pool.feeRate * shareOfPool;
    const totalFees = dailyFees * timePeriod.days;
    const yieldPct = (totalFees / deposit) * 100;
    const apr = (dailyFees * 365) / deposit * 100;
    const ammFees = deposit * (STANDARD_AMM_APR / 365) * timePeriod.days;
    const ammYield = (ammFees / deposit) * 100;
    return { dailyFees, totalFees, yieldPct, apr, ammFees, ammYield };
  }, [deposit, pool, timePeriod]);

  const handlePairChange = useCallback(
    (pair: string) => {
      const firstMatch = POOLS.findIndex((p) => p.pair === pair);
      if (firstMatch >= 0) setSelectedPoolIndex(firstMatch);
    },
    []
  );

  return (
    <div className="min-h-screen bg-met-base--2">
      {/* Header */}
      <header className="border-b border-met-border-ter">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-met bg-met-primary-400 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2L14 6V10L8 14L2 10V6L8 2Z" fill="#f9f9fb" />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-bold text-met-text tracking-tight">
                DLMM Fee Calculator
              </h1>
              <p className="text-[10px] text-met-text-ter">by Meteora</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-met-success/10 text-met-success text-[10px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-met-success animate-pulse" />
              ESTIMATES
            </span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Headline stats */}
        <div className="text-center space-y-2 pb-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-met-accent-400">
            METEORA DLMM
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-met-text">
            How much could you earn?
          </h2>
          <p className="text-sm text-met-text-sec max-w-md mx-auto">
            $182.2B total volume. $1.19B paid to LPs. Enter your numbers below.
          </p>
        </div>

        {/* Input Section */}
        <div className="rounded-met border border-met-stroke bg-met-container-sec p-5 space-y-6">
          {/* Deposit Amount */}
          <SliderInput
            label="Deposit Amount"
            value={deposit}
            onChange={setDeposit}
            min={100}
            max={500_000}
            step={100}
            format={(v) => `$${fmtNumber(v)}`}
          />

          {/* Token Pair */}
          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-wider text-met-text-sec">
              Token Pair
            </label>
            <div className="flex flex-wrap gap-2">
              {uniquePairs.map((pair) => (
                <button
                  key={pair}
                  onClick={() => handlePairChange(pair)}
                  className={`px-3 py-1.5 rounded-met text-xs font-medium transition-all duration-150 ${
                    selectedPair === pair
                      ? "bg-met-primary-400 text-met-text"
                      : "bg-met-base-1 text-met-text-sec hover:bg-met-base-2 hover:text-met-text"
                  }`}
                >
                  {pair}
                </button>
              ))}
            </div>
          </div>

          {/* Bin Step */}
          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-wider text-met-text-sec">
              Bin Step
            </label>
            <div className="flex flex-wrap gap-2">
              {matchingPools.map((p) => (
                <button
                  key={p.index}
                  onClick={() => setSelectedPoolIndex(p.index)}
                  className={`px-3 py-1.5 rounded-met text-xs font-medium transition-all duration-150 ${
                    selectedPoolIndex === p.index
                      ? "bg-met-accent-400 text-met-text"
                      : "bg-met-base-1 text-met-text-sec hover:bg-met-base-2 hover:text-met-text"
                  }`}
                >
                  {p.binStep} bps
                  <span className="ml-1.5 text-[10px] opacity-60">
                    ({(p.feeRate * 100).toFixed(2)}%)
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Time Period */}
          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-wider text-met-text-sec">
              Time Period
            </label>
            <div className="flex gap-1.5">
              {TIME_OPTIONS.map((t, i) => (
                <button
                  key={t.label}
                  onClick={() => setTimePeriodIndex(i)}
                  className={`flex-1 py-2 rounded-met text-xs font-semibold transition-all duration-150 ${
                    timePeriodIndex === i
                      ? "bg-met-primary-400 text-met-text"
                      : "bg-met-base-1 text-met-text-sec hover:bg-met-base-2 hover:text-met-text"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="grid grid-cols-2 gap-3">
          <ResultCard
            label="Estimated Fees"
            value={fmt(calc.totalFees)}
            sub={`${fmt(calc.dailyFees)}/day`}
            accent
          />
          <ResultCard
            label={`Yield (${timePeriod.label})`}
            value={fmtPct(calc.yieldPct)}
            sub={`${fmtPct(calc.apr)} APR`}
          />
          <ResultCard
            label="Your Share"
            value={fmtPct((deposit / (pool.tvl + deposit)) * 100)}
            sub={`of ${fmt(pool.tvl)} TVL`}
          />
          <ResultCard
            label="Pool Volume"
            value={fmt(pool.dailyVolume)}
            sub={`${(pool.feeRate * 100).toFixed(2)}% fee tier`}
          />
        </div>

        {/* Comparison */}
        <ComparisonBar dlmmYield={calc.apr} ammYield={STANDARD_AMM_APR * 100} />

        {/* Explainer */}
        <div className="rounded-met border border-met-border-ter bg-met-base--1 p-4 space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-met-text-ter">
            HOW THIS WORKS
          </p>
          <p className="text-xs text-met-text-sec leading-relaxed">
            DLMM (Dynamic Liquidity Market Maker) concentrates your liquidity in
            active price bins, so you earn fees on a larger share of trades
            compared to standard AMMs that spread liquidity across all prices.
            Higher bin steps mean wider bins, more fee per swap, but need
            rebalancing less often. Your actual yield depends on volume,
            volatility, and how actively you manage your position.
          </p>
          <p className="text-[10px] text-met-text-disabled">
            Estimates use pool averages. Not financial advice. Past performance
            does not guarantee future returns.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-met-border-ter mt-8">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between text-[10px] text-met-text-ter">
          <span>Meteora</span>
          <span>DLMM Fee Calculator v1.0</span>
        </div>
      </footer>
    </div>
  );
}
