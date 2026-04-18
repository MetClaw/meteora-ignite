"use client";

import { useState } from "react";

const GOOGLE_SCRIPT_URL = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL || "";

type Role = "trader" | "creator" | "";

export default function InterestForm() {
  const [role, setRole] = useState<Role>("");
  const [twitter, setTwitter] = useState("");
  const [products, setProducts] = useState("");
  const [improve, setImprove] = useState("");
  const [wallet, setWallet] = useState("");
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");

  const canSubmit =
    role && twitter.trim() && products.trim() && wallet.trim() && status !== "submitting";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setStatus("submitting");

    const payload = {
      timestamp: new Date().toISOString(),
      role,
      twitter: twitter.trim(),
      products: products.trim(),
      improve: improve.trim(),
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

      {/* Products used */}
      <div>
        <label
          htmlFor="products"
          className="block mb-2.5 text-[12px] font-medium tracking-[0.5px] uppercase"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Which Meteora products do you actively use?
        </label>
        <textarea
          id="products"
          value={products}
          onChange={(e) => setProducts(e.target.value)}
          placeholder="DLMM, Dynamic Pools, Vaults..."
          rows={2}
          className="form-field w-full px-4 py-3 text-[14px] resize-none"
          required
        />
      </div>

      {/* Product critique -- the real filter */}
      <div>
        <label
          htmlFor="improve"
          className="block mb-2.5 text-[12px] font-medium tracking-[0.5px] uppercase"
          style={{ color: "var(--color-text-secondary)" }}
        >
          What would you change about a Meteora product?
          <span
            className="ml-2 text-[11px] font-normal normal-case tracking-normal"
            style={{ color: "var(--color-text-dim)" }}
          >
            optional but helps
          </span>
        </label>
        <textarea
          id="improve"
          value={improve}
          onChange={(e) => setImprove(e.target.value)}
          placeholder="Pick any product. What's one thing you'd improve and why?"
          rows={3}
          className="form-field w-full px-4 py-3 text-[14px] resize-none"
        />
      </div>

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
