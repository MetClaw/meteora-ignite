"use client";

import { useEffect, useState, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════════
   PARTICLE CONSTELLATION CANVAS
   80 dots drifting slowly, connected by lines when close,
   gently pushing away from cursor. Living, breathing background.
   ═══════════════════════════════════════════════════════════════ */

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
}

function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);
  const dprRef = useRef(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    dprRef.current = dpr;
    const PARTICLE_COUNT = 70;
    const LINE_DIST = 140;
    const MOUSE_DIST = 180;
    const MOUSE_FORCE = 0.8;

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
    }

    function initParticles() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      particlesRef.current = Array.from({ length: PARTICLE_COUNT }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 1.2 + 0.4,
      }));
    }

    function draw() {
      if (!ctx || !canvas) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(dpr, dpr);

      const particles = particlesRef.current;

      // Update positions
      for (const p of particles) {
        // Mouse repulsion
        const dmx = p.x - mx;
        const dmy = p.y - my;
        const distM = Math.sqrt(dmx * dmx + dmy * dmy);
        if (distM < MOUSE_DIST && distM > 0) {
          const force = (1 - distM / MOUSE_DIST) * MOUSE_FORCE;
          p.vx += (dmx / distM) * force;
          p.vy += (dmy / distM) * force;
        }

        // Damping
        p.vx *= 0.98;
        p.vy *= 0.98;

        // Drift
        p.x += p.vx;
        p.y += p.vy;

        // Wrap edges
        if (p.x < -20) p.x = w + 20;
        if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20;
        if (p.y > h + 20) p.y = -20;
      }

      // Draw lines between close particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < LINE_DIST) {
            const alpha = (1 - dist / LINE_DIST) * 0.08;
            ctx.strokeStyle = `rgba(245, 75, 0, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw dots
      for (const p of particles) {
        // Glow near mouse
        const dmx = p.x - mx;
        const dmy = p.y - my;
        const distM = Math.sqrt(dmx * dmx + dmy * dmy);
        const brightness = distM < MOUSE_DIST ? 0.5 + (1 - distM / MOUSE_DIST) * 0.5 : 0.5;

        ctx.fillStyle = `rgba(255, 255, 255, ${brightness * 0.4})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
      rafRef.current = requestAnimationFrame(draw);
    }

    function onMouse(e: MouseEvent) {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    }

    resize();
    initParticles();
    draw();

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouse);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouse);
    };
  }, []);

  return <canvas ref={canvasRef} className="particle-canvas" />;
}

/* ═══════════════════════════════════════════════════════════════
   TEXT SCRAMBLE
   Characters morph through random glyphs before resolving.
   Pentagon demo signature effect.
   ═══════════════════════════════════════════════════════════════ */

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZΔΣΩΦΨλμπ0123456789@#$%&";

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
          if (frame > 3 + i * 2) {
            resolved[i] = true;
            return ch;
          }
          return CHARS[Math.floor(Math.random() * CHARS.length)];
        });
        setDisplay(next.join(""));
        if (resolved.every(Boolean)) clearInterval(interval);
      }, 35);
    }, delay);
    return () => clearTimeout(timer);
  }, [text, delay]);

  return <>{display}</>;
}

/* ═══════════════════════════════════════════════════════════════
   MAGNETIC BUTTON
   Subtly pulls toward cursor when nearby. Feels physical.
   ═══════════════════════════════════════════════════════════════ */

function MagneticButton({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleMouse = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const maxDist = 120;
    if (dist < maxDist) {
      const pull = (1 - dist / maxDist) * 8;
      setOffset({ x: (dx / dist) * pull, y: (dy / dist) * pull });
    } else {
      setOffset({ x: 0, y: 0 });
    }
  }, []);

  const handleLeave = useCallback(() => {
    setOffset({ x: 0, y: 0 });
  }, []);

  return (
    <button
      ref={ref}
      className={className}
      onClick={onClick}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      style={{
        transform: `translate(${offset.x}px, ${offset.y}px)`,
        transition: offset.x === 0 ? "transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)" : "none",
      }}
    >
      {children}
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ANIMATED COUNTER
   Numbers count up smoothly on mount.
   ═══════════════════════════════════════════════════════════════ */

function AnimatedNumber({ value, duration = 1200, delay = 0 }: { value: number; duration?: number; delay?: number }) {
  const [current, setCurrent] = useState(0);
  const hasStarted = useRef(false);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    const timer = setTimeout(() => {
      const start = performance.now();
      function tick() {
        const elapsed = performance.now() - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setCurrent(Math.round(eased * value));
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }, delay);
    return () => clearTimeout(timer);
  }, [value, duration, delay]);

  return <>{current}</>;
}

/* ═══════════════════════════════════════════════════════════════
   MAIN APPLICATION
   ═══════════════════════════════════════════════════════════════ */

const GOOGLE_SCRIPT_URL = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL || "";

export default function Home() {
  const [heroVisible, setHeroVisible] = useState(false);
  const [step, setStep] = useState(0); // 0 = hero, 1-3 = form steps
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  // Form state
  const [twitter, setTwitter] = useState("");
  const [months, setMonths] = useState("");
  const [volume, setVolume] = useState("");
  const [products, setProducts] = useState("");
  const [strategy, setStrategy] = useState("");
  const [improve, setImprove] = useState("");
  const [wallet, setWallet] = useState("");

  // Focus tracking
  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => {
    requestAnimationFrame(() => setHeroVisible(true));
  }, []);

  // Progress calculation
  const fields = [twitter, months, volume, products, strategy, wallet];
  const filled = fields.filter((f) => f.trim().length > 0).length;
  const progress = Math.round((filled / fields.length) * 100);

  // Step validation
  const step1Ready = twitter.trim() && months.trim() && volume.trim();
  const step2Ready = products.trim() && strategy.trim();
  const step3Ready = wallet.trim();

  function startApplication() {
    setStep(1);
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

  /* ── Success State ── */
  if (status === "success") {
    return (
      <div className="app-shell">
        <ParticleCanvas />
        <div className="grain" />
        <div className="progress-strip" style={{ "--strip-progress": "100%" } as React.CSSProperties} />

        <nav className="nav">
          <div className="nav-inner">
            <div className="nav-brand">
              <span className="nav-logo">RS</span>
              <span className="nav-name">RECON SQUAD</span>
            </div>
            <span className="nav-tag">by Meteora</span>
          </div>
        </nav>

        <main className="success-page">
          <div className="success-ring">
            <svg width="80" height="80" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(36,201,141,0.15)" strokeWidth="1.5" />
              <circle cx="40" cy="40" r="32" fill="none" stroke="#24c98d" strokeWidth="1.5"
                strokeDasharray={2 * Math.PI * 32} strokeDashoffset={0}
                style={{ transform: "rotate(-90deg)", transformOrigin: "center", transition: "stroke-dashoffset 1s cubic-bezier(0.22,1,0.36,1)" }}
              />
            </svg>
            <svg className="success-check" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#24c98d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" className="check-draw" />
            </svg>
          </div>
          <h1 className="success-title">You&apos;re in the queue</h1>
          <p className="success-sub">We review applications weekly.<br />If selected, you&apos;ll hear from us on X.</p>
          <div className="success-handle">@{twitter.replace("@", "")}</div>
        </main>
      </div>
    );
  }

  /* ── Main Render ── */
  return (
    <div className="app-shell">
      {/* Living background */}
      <ParticleCanvas />
      <div className="grain" />

      {/* Progress strip -- fills left to right as form completes */}
      <div
        className="progress-strip"
        style={{ "--strip-progress": step === 0 ? "0%" : `${progress}%` } as React.CSSProperties}
      />

      {/* Nav -- expandable shell for future routes */}
      <nav className="nav">
        <div className="nav-inner">
          <div className="nav-brand">
            <span className="nav-logo">RS</span>
            <span className="nav-name">RECON SQUAD</span>
          </div>
          <div className="nav-links">
            <span className="nav-link active">Apply</span>
            {/* Future routes */}
            {/* <span className="nav-link">Dashboard</span> */}
            {/* <span className="nav-link">Feedback</span> */}
          </div>
          <span className="nav-tag">by Meteora</span>
        </div>
      </nav>

      {/* Hero -- full viewport, cinematic */}
      <section className={`hero ${heroVisible ? "hero--visible" : ""}`}>
        <div className="hero-inner">
          <div className="hero-eyebrow s1">
            <span className="hero-eyebrow-dot" />
            <span>SEASON 01</span>
            <span className="hero-eyebrow-sep" />
            <span>7 SLOTS OPEN</span>
          </div>

          <h1 className="hero-title s2">
            Test what{" "}
            <span className="hero-accent">
              <TextScramble text="ships next" delay={1000} />
            </span>
          </h1>

          <p className="hero-sub s3">
            Early access to unreleased Meteora products.
            <br />Feedback direct to founders. USDC compensation.
          </p>

          <div className="hero-stats s4">
            <div className="hero-stat">
              <span className="hero-stat-value">
                <AnimatedNumber value={7} duration={800} delay={1400} />
              </span>
              <span className="hero-stat-label">TRADERS</span>
            </div>
            <div className="hero-stat-sep" />
            <div className="hero-stat">
              <span className="hero-stat-value">S01</span>
              <span className="hero-stat-label">SEASON</span>
            </div>
            <div className="hero-stat-sep" />
            <div className="hero-stat">
              <span className="hero-stat-value">USDC</span>
              <span className="hero-stat-label">COMPENSATION</span>
            </div>
          </div>

          <div className="s5">
            <MagneticButton className="btn-apply" onClick={startApplication}>
              Apply now
            </MagneticButton>
          </div>

          <div className="s6 scroll-cue">
            <div className="scroll-cue-line" />
          </div>
        </div>
      </section>

      {/* Application -- 3-step flow */}
      <section id="application" className="app-section">
        <div className="app-container">

          {/* Sidebar */}
          <aside className="app-sidebar">
            <div className="app-sidebar-sticky">
              {/* Progress ring */}
              <div className="progress-ring">
                <svg width="80" height="80" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1.5" />
                  <circle
                    cx="40" cy="40" r="32" fill="none"
                    stroke={progress === 100 ? "#24c98d" : "#f54b00"}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 32}
                    strokeDashoffset={2 * Math.PI * 32 - (progress / 100) * 2 * Math.PI * 32}
                    style={{
                      transform: "rotate(-90deg)",
                      transformOrigin: "center",
                      transition: "stroke-dashoffset 0.6s cubic-bezier(0.22,1,0.36,1), stroke 0.3s ease",
                    }}
                  />
                </svg>
                <span className="progress-ring-val">
                  {progress}<span className="progress-ring-pct">%</span>
                </span>
              </div>

              <div className="sidebar-context">
                <h3 className="sidebar-label">
                  {step === 0 && "Ready when you are"}
                  {step === 1 && "Identity"}
                  {step === 2 && "Experience"}
                  {step === 3 && "Final details"}
                </h3>
                <p className="sidebar-desc">
                  {step === 0 && "Hit Apply now to start your application."}
                  {step === 1 && "Your X handle and trading activity."}
                  {step === 2 && "Which products and your strategy."}
                  {step === 3 && "One optional question and your wallet."}
                </p>
              </div>

              {/* Step indicators */}
              <div className="step-nav">
                {[1, 2, 3].map((s) => (
                  <button
                    key={s}
                    className={`step-btn ${step === s ? "active" : ""} ${step > s ? "done" : ""}`}
                    onClick={() => {
                      if (s <= step || (s === 2 && step1Ready) || (s === 3 && step1Ready && step2Ready)) setStep(s);
                    }}
                    disabled={s > step && !(s === 2 && !!step1Ready) && !(s === 3 && !!step1Ready && !!step2Ready)}
                  >
                    <span className="step-btn-num">{String(s).padStart(2, "0")}</span>
                  </button>
                ))}
                <div className="step-track">
                  <div
                    className="step-track-fill"
                    style={{ width: step === 0 ? "0%" : step === 1 ? "0%" : step === 2 ? "50%" : "100%" }}
                  />
                </div>
              </div>
            </div>
          </aside>

          {/* Form area */}
          <div className="form-area">
            {step === 0 && (
              <div className="form-empty">
                <div className="form-empty-lines">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="form-empty-line" style={{ width: `${60 + Math.random() * 30}%`, animationDelay: `${i * 0.1}s` }} />
                  ))}
                </div>
                <p className="form-empty-text">Your application will appear here</p>
              </div>
            )}

            {/* Step 1 */}
            {step === 1 && (
              <div className="form-step" key="step1">
                <div className="form-step-head">
                  <span className="form-step-num">01</span>
                  <div>
                    <h2 className="form-step-title">Identity</h2>
                    <p className="form-step-sub">How we find you and verify your history</p>
                  </div>
                </div>

                <div className="form-fields">
                  <div className={`field ${focusedField === "twitter" ? "field--focused" : ""} ${twitter ? "field--filled" : ""}`}>
                    <label htmlFor="twitter" className="field-label">X HANDLE</label>
                    <input
                      id="twitter" type="text" value={twitter}
                      onChange={(e) => setTwitter(e.target.value)}
                      onFocus={() => setFocusedField("twitter")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="@yourhandle"
                      className="field-input"
                      autoComplete="off"
                    />
                  </div>

                  <div className="field-row">
                    <div className={`field ${focusedField === "months" ? "field--focused" : ""} ${months ? "field--filled" : ""}`}>
                      <label htmlFor="months" className="field-label">MONTHS ON METEORA</label>
                      <input
                        id="months" type="text" value={months}
                        onChange={(e) => setMonths(e.target.value)}
                        onFocus={() => setFocusedField("months")}
                        onBlur={() => setFocusedField(null)}
                        placeholder="e.g. 6"
                        className="field-input"
                        autoComplete="off"
                      />
                    </div>
                    <div className={`field ${focusedField === "volume" ? "field--focused" : ""} ${volume ? "field--filled" : ""}`}>
                      <label htmlFor="volume" className="field-label">MONTHLY VOLUME (USD)</label>
                      <input
                        id="volume" type="text" value={volume}
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

                <div className="form-actions">
                  <div />
                  <button className="btn-continue" disabled={!step1Ready} onClick={() => setStep(2)}>
                    Continue
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </button>
                </div>
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div className="form-step" key="step2">
                <div className="form-step-head">
                  <span className="form-step-num">02</span>
                  <div>
                    <h2 className="form-step-title">Experience</h2>
                    <p className="form-step-sub">Your products and approach</p>
                  </div>
                </div>

                <div className="form-fields">
                  <div className={`field ${focusedField === "products" ? "field--focused" : ""} ${products ? "field--filled" : ""}`}>
                    <label htmlFor="products" className="field-label">WHICH METEORA PRODUCTS DO YOU ACTIVELY LP ON?</label>
                    <textarea
                      id="products" value={products}
                      onChange={(e) => setProducts(e.target.value)}
                      onFocus={() => setFocusedField("products")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="DLMM, Dynamic Pools, Dynamic Vaults..."
                      rows={2} className="field-textarea"
                    />
                  </div>

                  <div className={`field ${focusedField === "strategy" ? "field--focused" : ""} ${strategy ? "field--filled" : ""}`}>
                    <label htmlFor="strategy" className="field-label">WHAT&apos;S YOUR TYPICAL LP STRATEGY?</label>
                    <textarea
                      id="strategy" value={strategy}
                      onChange={(e) => setStrategy(e.target.value)}
                      onFocus={() => setFocusedField("strategy")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="Concentrated ranges, wide bins, vault-and-forget, active rebalancing..."
                      rows={3} className="field-textarea"
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button className="btn-back" onClick={() => setStep(1)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                    Back
                  </button>
                  <button className="btn-continue" disabled={!step2Ready} onClick={() => setStep(3)}>
                    Continue
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </button>
                </div>
              </div>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <div className="form-step" key="step3">
                <div className="form-step-head">
                  <span className="form-step-num">03</span>
                  <div>
                    <h2 className="form-step-title">Final</h2>
                    <p className="form-step-sub">The question that matters and where to pay you</p>
                  </div>
                </div>

                <div className="form-fields">
                  <div className={`field ${focusedField === "improve" ? "field--focused" : ""} ${improve ? "field--filled" : ""}`}>
                    <label htmlFor="improve" className="field-label">
                      WHAT&apos;S ONE THING ABOUT METEORA&apos;S LP EXPERIENCE YOU&apos;D CHANGE?
                      <span className="field-optional">optional</span>
                    </label>
                    <textarea
                      id="improve" value={improve}
                      onChange={(e) => setImprove(e.target.value)}
                      onFocus={() => setFocusedField("improve")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="Fee structure, position management, analytics, bin UX..."
                      rows={4} className="field-textarea"
                    />
                  </div>

                  <div className={`field ${focusedField === "wallet" ? "field--focused" : ""} ${wallet ? "field--filled" : ""}`}>
                    <label htmlFor="wallet" className="field-label">
                      WALLET ADDRESS
                      <span className="field-hint">for compensation</span>
                    </label>
                    <input
                      id="wallet" type="text" value={wallet}
                      onChange={(e) => setWallet(e.target.value)}
                      onFocus={() => setFocusedField("wallet")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="Solana public key"
                      className="field-input field-mono"
                      autoComplete="off"
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button className="btn-back" onClick={() => setStep(2)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                    Back
                  </button>
                  <button
                    className="btn-submit"
                    disabled={!step3Ready || status === "submitting"}
                    onClick={handleSubmit}
                  >
                    {status === "submitting" ? (
                      <>
                        <span className="btn-spinner" />
                        Submitting...
                      </>
                    ) : (
                      "Submit application"
                    )}
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
        <div className="footer-inner">
          <span className="footer-brand">RECON SQUAD</span>
          <span className="footer-sep" />
          <span className="footer-tag">by Meteora</span>
        </div>
      </footer>
    </div>
  );
}
