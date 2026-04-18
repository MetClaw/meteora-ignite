"use client";

import { useEffect, useState, useRef, useCallback } from "react";

/* ── Text Scramble ── */
const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%";

function TextScramble({ text, delay = 600 }: { text: string; delay?: number }) {
  const [display, setDisplay] = useState(text);
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;
    const chars = text.split("");
    const resolved = new Array(chars.length).fill(false);
    let frame = 0;

    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        frame++;
        const next = chars.map((ch, i) => {
          if (ch === " ") return " ";
          if (resolved[i]) return ch;
          if (frame > 2 + i * 2) { resolved[i] = true; return ch; }
          return CHARS[Math.floor(Math.random() * CHARS.length)];
        });
        setDisplay(next.join(""));
        if (resolved.every(Boolean)) clearInterval(interval);
      }, 40);
    }, delay);
    return () => clearTimeout(timer);
  }, [text, delay]);

  return <>{display}</>;
}

/* ── Cursor Glow ── */
function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function onMove(e: MouseEvent) {
      if (ref.current) {
        ref.current.style.setProperty("--gx", `${e.clientX}px`);
        ref.current.style.setProperty("--gy", `${e.clientY}px`);
      }
    }
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);
  return <div ref={ref} className="cursor-glow" />;
}

/* ── Progress Ring ── */
function ProgressRing({ progress }: { progress: number }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const offset = circ - (progress / 100) * circ;

  return (
    <div className="progress-ring-wrap">
      <svg width="72" height="72" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="2" />
        <circle
          cx="36" cy="36" r={r} fill="none"
          stroke={progress === 100 ? "#24c98d" : "var(--color-accent)"}
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{
            transform: "rotate(-90deg)",
            transformOrigin: "center",
            transition: "stroke-dashoffset 0.5s cubic-bezier(0.22, 1, 0.36, 1), stroke 0.3s ease",
          }}
        />
      </svg>
      <span className="progress-ring-text">
        {Math.round(progress)}
        <span className="progress-ring-pct">%</span>
      </span>
    </div>
  );
}

/* ── Main ── */
const GOOGLE_SCRIPT_URL = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL || "";

export default function Home() {
  const [heroVisible, setHeroVisible] = useState(false);
  const [step, setStep] = useState(0); // 0 = hero, 1-3 = form steps
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  // Form state -- trader only
  const [twitter, setTwitter] = useState("");
  const [months, setMonths] = useState("");
  const [volume, setVolume] = useState("");
  const [products, setProducts] = useState("");
  const [strategy, setStrategy] = useState("");
  const [improve, setImprove] = useState("");
  const [wallet, setWallet] = useState("");

  // Focus tracking for field animations
  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => {
    requestAnimationFrame(() => setHeroVisible(true));
  }, []);

  // Calculate progress
  const fields = [twitter, months, volume, products, strategy, wallet];
  const filled = fields.filter((f) => f.trim().length > 0).length;
  const progress = Math.round((filled / fields.length) * 100);

  // Step validation
  const step1Ready = twitter.trim() && months.trim() && volume.trim();
  const step2Ready = products.trim() && strategy.trim();
  const step3Ready = wallet.trim();

  function startApplication() {
    setStep(1);
    // Scroll to form
    setTimeout(() => {
      document.getElementById("application")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }

  async function handleSubmit() {
    if (!step3Ready) return;
    setStatus("submitting");

    const payload = {
      timestamp: new Date().toISOString(),
      role: "trader",
      twitter: twitter.trim(),
      months_on_meteora: months.trim(),
      monthly_volume: volume.trim(),
      products: products.trim(),
      strategy: strategy.trim(),
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
      <>
        <div className="grain" />
        <CursorGlow />
        <div className="orange-strip" />
        <div className="success-page">
          <div className="success-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#24c98d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" className="check-draw" />
            </svg>
          </div>
          <h1 className="success-title">You&apos;re in the queue</h1>
          <p className="success-sub">We review applications weekly.<br />If selected, you&apos;ll hear from us on X.</p>
          <div className="success-handle">@{twitter.replace("@", "")}</div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Atmosphere */}
      <div className="grain" />
      <CursorGlow />
      <div className="orange-strip" />

      {/* Hero */}
      <section className={`hero ${heroVisible ? "hero--visible" : ""}`}>
        <div className="hero-inner">
          <div className="hero-stagger s1 hero-label">RECON SQUAD</div>
          <h1 className="hero-stagger s2 hero-title">
            Test what{" "}
            <span className="hero-accent">
              <TextScramble text="ships next" delay={1000} />
            </span>
          </h1>
          <p className="hero-stagger s3 hero-sub">
            7 traders. Early access to unreleased Meteora products.
            <br />Feedback direct to founders. USDC compensation.
          </p>

          <div className="hero-stagger s4 hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-value">7</span>
              <span className="hero-stat-label">SLOTS</span>
            </div>
            <div className="hero-stat-sep" />
            <div className="hero-stat">
              <span className="hero-stat-value">S01</span>
              <span className="hero-stat-label">SEASON</span>
            </div>
            <div className="hero-stat-sep" />
            <div className="hero-stat">
              <span className="hero-stat-value">USDC</span>
              <span className="hero-stat-label">PER ROUND</span>
            </div>
          </div>

          <button
            className="hero-stagger s5 btn-apply"
            onClick={startApplication}
          >
            Apply now
          </button>

          <div className="hero-stagger s5 scroll-hint">
            <div className="scroll-line" />
          </div>
        </div>
      </section>

      {/* Application */}
      <section id="application" className="app-section">
        <div className="app-container">

          {/* Left: context + progress */}
          <div className="app-sidebar">
            <div className="app-sidebar-sticky">
              <ProgressRing progress={progress} />
              <div className="app-sidebar-info">
                <h3 className="app-sidebar-title">
                  {step === 0 && "Ready when you are"}
                  {step === 1 && "Who you are"}
                  {step === 2 && "How you trade"}
                  {step === 3 && "Final details"}
                </h3>
                <p className="app-sidebar-desc">
                  {step === 0 && "Click apply above to start your application."}
                  {step === 1 && "Your X handle and trading activity on Meteora."}
                  {step === 2 && "Which products you use and your approach."}
                  {step === 3 && "One optional question and your wallet for compensation."}
                </p>
              </div>

              <div className="step-dots">
                {[1, 2, 3].map((s) => (
                  <button
                    key={s}
                    className={`step-dot ${step === s ? "active" : ""} ${step > s ? "done" : ""}`}
                    onClick={() => { if (s <= step || (s === 2 && step1Ready) || (s === 3 && step2Ready)) setStep(s); }}
                    disabled={s > step && !(s === 2 && step1Ready) && !(s === 3 && step1Ready && step2Ready)}
                  >
                    <span className="step-dot-num">{s}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: form steps */}
          <div className="app-form">
            {step === 0 && (
              <div className="form-placeholder">
                <div className="form-placeholder-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </div>
                <p className="form-placeholder-text">Click &quot;Apply now&quot; above to start</p>
              </div>
            )}

            {/* Step 1: Identity */}
            {step === 1 && (
              <div className="form-step" key="step1">
                <div className="form-step-header">
                  <span className="form-step-num">01</span>
                  <h2 className="form-step-title">Identity</h2>
                </div>

                <div className="form-fields">
                  <div className={`field-group ${focusedField === "twitter" ? "focused" : ""}`}>
                    <label htmlFor="twitter" className="field-label">X handle</label>
                    <input
                      id="twitter"
                      type="text"
                      value={twitter}
                      onChange={(e) => setTwitter(e.target.value)}
                      onFocus={() => setFocusedField("twitter")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="@yourhandle"
                      className="field-input"
                      autoComplete="off"
                    />
                  </div>

                  <div className="field-row">
                    <div className={`field-group ${focusedField === "months" ? "focused" : ""}`}>
                      <label htmlFor="months" className="field-label">Months on Meteora</label>
                      <input
                        id="months"
                        type="text"
                        value={months}
                        onChange={(e) => setMonths(e.target.value)}
                        onFocus={() => setFocusedField("months")}
                        onBlur={() => setFocusedField(null)}
                        placeholder="e.g. 6"
                        className="field-input"
                        autoComplete="off"
                      />
                    </div>
                    <div className={`field-group ${focusedField === "volume" ? "focused" : ""}`}>
                      <label htmlFor="volume" className="field-label">Monthly volume (USD)</label>
                      <input
                        id="volume"
                        type="text"
                        value={volume}
                        onChange={(e) => setVolume(e.target.value)}
                        onFocus={() => setFocusedField("volume")}
                        onBlur={() => setFocusedField(null)}
                        placeholder="e.g. 50k"
                        className="field-input"
                        autoComplete="off"
                      />
                    </div>
                  </div>
                </div>

                <div className="form-nav">
                  <div />
                  <button
                    className="btn-next"
                    disabled={!step1Ready}
                    onClick={() => setStep(2)}
                  >
                    Continue
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Experience */}
            {step === 2 && (
              <div className="form-step" key="step2">
                <div className="form-step-header">
                  <span className="form-step-num">02</span>
                  <h2 className="form-step-title">Experience</h2>
                </div>

                <div className="form-fields">
                  <div className={`field-group ${focusedField === "products" ? "focused" : ""}`}>
                    <label htmlFor="products" className="field-label">
                      Which Meteora products do you actively LP on?
                    </label>
                    <textarea
                      id="products"
                      value={products}
                      onChange={(e) => setProducts(e.target.value)}
                      onFocus={() => setFocusedField("products")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="DLMM, Dynamic Pools, Dynamic Vaults..."
                      rows={2}
                      className="field-textarea"
                    />
                  </div>

                  <div className={`field-group ${focusedField === "strategy" ? "focused" : ""}`}>
                    <label htmlFor="strategy" className="field-label">
                      What&apos;s your typical LP strategy?
                    </label>
                    <textarea
                      id="strategy"
                      value={strategy}
                      onChange={(e) => setStrategy(e.target.value)}
                      onFocus={() => setFocusedField("strategy")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="Concentrated ranges, wide bins, vault-and-forget, active rebalancing..."
                      rows={3}
                      className="field-textarea"
                    />
                  </div>
                </div>

                <div className="form-nav">
                  <button className="btn-back" onClick={() => setStep(1)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    Back
                  </button>
                  <button
                    className="btn-next"
                    disabled={!step2Ready}
                    onClick={() => setStep(3)}
                  >
                    Continue
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Vision + Submit */}
            {step === 3 && (
              <div className="form-step" key="step3">
                <div className="form-step-header">
                  <span className="form-step-num">03</span>
                  <h2 className="form-step-title">Final</h2>
                </div>

                <div className="form-fields">
                  <div className={`field-group ${focusedField === "improve" ? "focused" : ""}`}>
                    <label htmlFor="improve" className="field-label">
                      What&apos;s one thing about Meteora&apos;s LP experience you&apos;d change?
                      <span className="field-optional">optional -- this is the real filter</span>
                    </label>
                    <textarea
                      id="improve"
                      value={improve}
                      onChange={(e) => setImprove(e.target.value)}
                      onFocus={() => setFocusedField("improve")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="Fee structure, position management, analytics, bin UX..."
                      rows={4}
                      className="field-textarea"
                    />
                  </div>

                  <div className={`field-group ${focusedField === "wallet" ? "focused" : ""}`}>
                    <label htmlFor="wallet" className="field-label">
                      Wallet address
                      <span className="field-hint">for compensation</span>
                    </label>
                    <input
                      id="wallet"
                      type="text"
                      value={wallet}
                      onChange={(e) => setWallet(e.target.value)}
                      onFocus={() => setFocusedField("wallet")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="Solana public key"
                      className="field-input field-mono"
                      autoComplete="off"
                    />
                  </div>
                </div>

                <div className="form-nav">
                  <button className="btn-back" onClick={() => setStep(2)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    Back
                  </button>
                  <button
                    className="btn-submit"
                    disabled={!step3Ready || status === "submitting"}
                    onClick={handleSubmit}
                  >
                    {status === "submitting" ? "Submitting..." : "Submit application"}
                  </button>
                </div>

                {status === "error" && (
                  <p className="form-error">Something went wrong. Try again.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <span className="footer-brand">RECON SQUAD</span>
        <span className="footer-sep" />
        <span className="footer-sub">by Meteora</span>
      </footer>
    </>
  );
}
