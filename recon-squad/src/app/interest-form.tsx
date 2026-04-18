"use client";

import { useState } from "react";

const GOOGLE_SCRIPT_URL = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL || "";

type Role = "trader" | "creator" | "";

export default function InterestForm() {
  const [role, setRole] = useState<Role>("");
  const [wallet, setWallet] = useState("");
  const [twitter, setTwitter] = useState("");
  const [products, setProducts] = useState("");
  const [pitch, setPitch] = useState("");
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");

  const canSubmit =
    role && wallet.trim() && products.trim() && status !== "submitting";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setStatus("submitting");

    const payload = {
      timestamp: new Date().toISOString(),
      role,
      wallet: wallet.trim(),
      twitter: twitter.trim(),
      products: products.trim(),
      pitch: pitch.trim(),
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
      <div className="reveal flex flex-col items-center gap-8 py-20 text-center">
        <div className="success-ring success-ring-pulse flex h-16 w-16 items-center justify-center rounded-full"
          style={{
            border: "1.5px solid var(--color-accent)",
            background: "rgba(245, 75, 0, 0.04)",
          }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
            stroke="var(--color-accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" className="check-draw" />
          </svg>
        </div>
        <div>
          <h2 className="text-[22px] font-semibold tracking-[-0.3px]"
            style={{ color: "var(--color-text)" }}>
            You&apos;re in the queue
          </h2>
          <p className="mt-3 text-[14px] leading-[1.7]"
            style={{ color: "var(--color-text-secondary)" }}>
            We review applications weekly. If selected,<br />
            you&apos;ll hear from us on X.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">

      {/* Role */}
      <div>
        <label className="block mb-3 text-[12px] font-medium tracking-[0.5px] uppercase"
          style={{ color: "var(--color-text-secondary)" }}>
          I am a
        </label>
        <div className="flex gap-3">
          {(["trader", "creator"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`role-btn flex-1 py-3.5 text-[13px] font-medium tracking-[0.5px] rounded-lg ${
                role === r ? "active" : ""
              }`}
            >
              <span className="capitalize">{r}</span>
              <span className="ml-2 text-[11px] opacity-50">
                {r === "trader" ? "7 slots" : "3 slots"}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Wallet */}
      <div>
        <label htmlFor="wallet" className="block mb-3 text-[12px] font-medium tracking-[0.5px] uppercase"
          style={{ color: "var(--color-text-secondary)" }}>
          Wallet address
        </label>
        <input
          id="wallet"
          type="text"
          value={wallet}
          onChange={(e) => setWallet(e.target.value)}
          placeholder="Solana public key"
          className="form-field w-full px-4 py-3.5 text-[14px]"
          style={{ fontFamily: "var(--font-mono)" }}
          required
        />
      </div>

      {/* Twitter */}
      <div>
        <label htmlFor="twitter" className="block mb-3 text-[12px] font-medium tracking-[0.5px] uppercase"
          style={{ color: "var(--color-text-secondary)" }}>
          X handle
          <span className="ml-2 text-[11px] font-normal normal-case tracking-normal"
            style={{ color: "var(--color-text-dim)" }}>
            optional
          </span>
        </label>
        <input
          id="twitter"
          type="text"
          value={twitter}
          onChange={(e) => setTwitter(e.target.value)}
          placeholder="@"
          className="form-field w-full px-4 py-3.5 text-[14px]"
        />
      </div>

      {/* Products */}
      <div>
        <label htmlFor="products" className="block mb-3 text-[12px] font-medium tracking-[0.5px] uppercase"
          style={{ color: "var(--color-text-secondary)" }}>
          What do you use on Meteora?
        </label>
        <textarea
          id="products"
          value={products}
          onChange={(e) => setProducts(e.target.value)}
          placeholder="DLMM, Dynamic Pools, Vaults..."
          rows={2}
          className="form-field w-full px-4 py-3.5 text-[14px] resize-none"
          required
        />
      </div>

      {/* Pitch */}
      <div>
        <label htmlFor="pitch" className="block mb-3 text-[12px] font-medium tracking-[0.5px] uppercase"
          style={{ color: "var(--color-text-secondary)" }}>
          Why you?
          <span className="ml-2 text-[11px] font-normal normal-case tracking-normal"
            style={{ color: "var(--color-text-dim)" }}>
            optional
          </span>
        </label>
        <textarea
          id="pitch"
          value={pitch}
          onChange={(e) => setPitch(e.target.value)}
          placeholder="What makes you a good tester?"
          rows={2}
          className="form-field w-full px-4 py-3.5 text-[14px] resize-none"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={!canSubmit}
        className="submit-btn mt-3 w-full py-4 text-[14px] font-semibold tracking-[0.3px] rounded-lg transition-all duration-250"
        style={{
          color: canSubmit ? "white" : undefined,
        }}
      >
        {status === "submitting" ? "Submitting..." : "Submit interest"}
      </button>

      {status === "error" && (
        <p className="text-center text-[13px]" style={{ color: "#f04438" }}>
          Something went wrong. Try again.
        </p>
      )}
    </form>
  );
}
