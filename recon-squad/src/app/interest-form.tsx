"use client";

import { useState } from "react";

const GOOGLE_SCRIPT_URL = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL || "";

type Role = "trader" | "creator" | "";

export default function InterestForm() {
  const [role, setRole] = useState<Role>("");
  const [twitter, setTwitter] = useState("");
  // Trader fields
  const [traderProducts, setTraderProducts] = useState("");
  const [traderStrategy, setTraderStrategy] = useState("");
  const [traderImprove, setTraderImprove] = useState("");
  // Creator fields
  const [creatorLaunched, setCreatorLaunched] = useState("");
  const [creatorTools, setCreatorTools] = useState("");
  const [creatorHardest, setCreatorHardest] = useState("");
  // Shared
  const [wallet, setWallet] = useState("");
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");

  const traderReady = traderProducts.trim() && traderStrategy.trim();
  const creatorReady = creatorLaunched.trim() && creatorTools.trim();
  const roleFieldsReady = role === "trader" ? traderReady : role === "creator" ? creatorReady : false;

  const canSubmit =
    role && twitter.trim() && roleFieldsReady && wallet.trim() && status !== "submitting";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setStatus("submitting");

    const payload = {
      timestamp: new Date().toISOString(),
      role,
      twitter: twitter.trim(),
      ...(role === "trader"
        ? {
            products: traderProducts.trim(),
            strategy: traderStrategy.trim(),
            improve: traderImprove.trim(),
          }
        : {
            launched_before: creatorLaunched.trim(),
            tools_used: creatorTools.trim(),
            hardest_part: creatorHardest.trim(),
          }),
      wallet: wallet.trim(),
    };

    try {
      if (GOOGLE_SCRIPT_URL) {
        await fetch(GOOGLE_SCRIPT_URL, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-8 py-16 text-center">
        <div
          className="success-ring success-ring-pulse flex h-16 w-16 items-center justify-center rounded-full"
          style={{
            border: "1.5px solid var(--color-accent)",
            background: "var(--color-accent-subtle)",
          }}
        >
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" className="check-draw" />
          </svg>
        </div>
        <div>
          <h2
            className="text-[22px] font-semibold tracking-[-0.3px]"
            style={{ color: "var(--color-text)" }}
          >
            You&apos;re in the queue
          </h2>
          <p
            className="mt-3 text-[14px] leading-[1.7]"
            style={{ color: "var(--color-text-secondary)" }}
          >
            We review applications weekly. If selected,
            <br />
            you&apos;ll hear from us on X.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-7">
      {/* Role */}
      <div>
        <label
          className="block mb-2.5 text-[12px] font-medium tracking-[0.5px] uppercase"
          style={{ color: "var(--color-text-secondary)" }}
        >
          I am a
        </label>
        <div className="flex gap-3">
          {(["trader", "creator"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`role-btn flex-1 py-3 text-[13px] font-medium tracking-[0.3px] rounded-lg ${
                role === r ? "active" : ""
              }`}
            >
              <span className="capitalize">{r}</span>
              <span
                className="ml-2 text-[11px]"
                style={{ color: "var(--color-text-dim)" }}
              >
                {r === "trader" ? "7 slots" : "3 slots"}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* X handle */}
      <div>
        <label
          htmlFor="twitter"
          className="block mb-2.5 text-[12px] font-medium tracking-[0.5px] uppercase"
          style={{ color: "var(--color-text-secondary)" }}
        >
          X handle
        </label>
        <input
          id="twitter"
          type="text"
          value={twitter}
          onChange={(e) => setTwitter(e.target.value)}
          placeholder="@yourhandle"
          className="form-field w-full px-4 py-3 text-[14px]"
          required
        />
      </div>

      {/* Trader-specific questions */}
      {role === "trader" && (
        <>
          <div>
            <label
              htmlFor="traderProducts"
              className="block mb-2.5 text-[12px] font-medium tracking-[0.5px] uppercase"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Which Meteora products do you actively LP on?
            </label>
            <textarea
              id="traderProducts"
              value={traderProducts}
              onChange={(e) => setTraderProducts(e.target.value)}
              placeholder="DLMM, Dynamic Pools, Dynamic Vaults..."
              rows={2}
              className="form-field w-full px-4 py-3 text-[14px] resize-none"
              required
            />
          </div>

          <div>
            <label
              htmlFor="traderStrategy"
              className="block mb-2.5 text-[12px] font-medium tracking-[0.5px] uppercase"
              style={{ color: "var(--color-text-secondary)" }}
            >
              What&apos;s your typical LP strategy?
            </label>
            <textarea
              id="traderStrategy"
              value={traderStrategy}
              onChange={(e) => setTraderStrategy(e.target.value)}
              placeholder="Concentrated ranges, wide bins, vault-and-forget, active rebalancing..."
              rows={2}
              className="form-field w-full px-4 py-3 text-[14px] resize-none"
              required
            />
          </div>

          <div>
            <label
              htmlFor="traderImprove"
              className="block mb-2.5 text-[12px] font-medium tracking-[0.5px] uppercase"
              style={{ color: "var(--color-text-secondary)" }}
            >
              What&apos;s one thing about Meteora&apos;s LP experience you&apos;d change?
              <span
                className="ml-2 text-[11px] font-normal normal-case tracking-normal"
                style={{ color: "var(--color-text-dim)" }}
              >
                optional but this is the real filter
              </span>
            </label>
            <textarea
              id="traderImprove"
              value={traderImprove}
              onChange={(e) => setTraderImprove(e.target.value)}
              placeholder="Fee structure, position management, analytics, bin UX..."
              rows={3}
              className="form-field w-full px-4 py-3 text-[14px] resize-none"
            />
          </div>
        </>
      )}

      {/* Creator-specific questions */}
      {role === "creator" && (
        <>
          <div>
            <label
              htmlFor="creatorLaunched"
              className="block mb-2.5 text-[12px] font-medium tracking-[0.5px] uppercase"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Have you launched a token before? If so, where?
            </label>
            <textarea
              id="creatorLaunched"
              value={creatorLaunched}
              onChange={(e) => setCreatorLaunched(e.target.value)}
              placeholder="Pump.fun, Meteora DBC, Raydium, no prior launches..."
              rows={2}
              className="form-field w-full px-4 py-3 text-[14px] resize-none"
              required
            />
          </div>

          <div>
            <label
              htmlFor="creatorTools"
              className="block mb-2.5 text-[12px] font-medium tracking-[0.5px] uppercase"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Which Meteora launch tools have you used?
            </label>
            <textarea
              id="creatorTools"
              value={creatorTools}
              onChange={(e) => setCreatorTools(e.target.value)}
              placeholder="DBC, DAMM v2, Dynamic Pools for initial liquidity..."
              rows={2}
              className="form-field w-full px-4 py-3 text-[14px] resize-none"
              required
            />
          </div>

          <div>
            <label
              htmlFor="creatorHardest"
              className="block mb-2.5 text-[12px] font-medium tracking-[0.5px] uppercase"
              style={{ color: "var(--color-text-secondary)" }}
            >
              What&apos;s the hardest part of launching liquidity for a new token?
              <span
                className="ml-2 text-[11px] font-normal normal-case tracking-normal"
                style={{ color: "var(--color-text-dim)" }}
              >
                optional but this is the real filter
              </span>
            </label>
            <textarea
              id="creatorHardest"
              value={creatorHardest}
              onChange={(e) => setCreatorHardest(e.target.value)}
              placeholder="Price discovery, initial liquidity depth, migration timing, community coordination..."
              rows={3}
              className="form-field w-full px-4 py-3 text-[14px] resize-none"
            />
          </div>
        </>
      )}

      {/* Wallet */}
      <div>
        <label
          htmlFor="wallet"
          className="block mb-2.5 text-[12px] font-medium tracking-[0.5px] uppercase"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Wallet address
          <span
            className="ml-2 text-[11px] font-normal normal-case tracking-normal"
            style={{ color: "var(--color-text-dim)" }}
          >
            for compensation
          </span>
        </label>
        <input
          id="wallet"
          type="text"
          value={wallet}
          onChange={(e) => setWallet(e.target.value)}
          placeholder="Solana public key"
          className="form-field w-full px-4 py-3 text-[14px]"
          style={{ fontFamily: "var(--font-mono)" }}
          required
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={!canSubmit}
        className="submit-btn mt-2 w-full py-3.5 text-[14px] font-semibold tracking-[0.3px] rounded-lg"
      >
        {status === "submitting" ? "Submitting..." : "Apply now"}
      </button>

      {status === "error" && (
        <p className="text-center text-[13px]" style={{ color: "#f04438" }}>
          Something went wrong. Try again.
        </p>
      )}
    </form>
  );
}
