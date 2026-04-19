"use client";

import { useEffect, useState, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════════
   PARTICLE CONSTELLATION CANVAS
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
    const PARTICLE_COUNT = 50;
    const LINE_DIST = 120;
    const MOUSE_DIST = 160;
    const MOUSE_FORCE = 0.6;

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
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
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

      for (const p of particles) {
        const dmx = p.x - mx;
        const dmy = p.y - my;
        const distM = Math.sqrt(dmx * dmx + dmy * dmy);
        if (distM < MOUSE_DIST && distM > 0) {
          const force = (1 - distM / MOUSE_DIST) * MOUSE_FORCE;
          p.vx += (dmx / distM) * force;
          p.vy += (dmy / distM) * force;
        }
        p.vx *= 0.98;
        p.vy *= 0.98;
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -20) p.x = w + 20;
        if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20;
        if (p.y > h + 20) p.y = -20;
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < LINE_DIST) {
            const alpha = (1 - dist / LINE_DIST) * 0.06;
            ctx.strokeStyle = `rgba(245, 75, 0, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      for (const p of particles) {
        const dmx = p.x - mx;
        const dmy = p.y - my;
        const distM = Math.sqrt(dmx * dmx + dmy * dmy);
        const brightness = distM < MOUSE_DIST ? 0.5 + (1 - distM / MOUSE_DIST) * 0.5 : 0.5;
        ctx.fillStyle = `rgba(255, 255, 255, ${brightness * 0.35})`;
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
   ═══════════════════════════════════════════════════════════════ */

function MagneticButton({
  children,
  onClick,
  className,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
  disabled?: boolean;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleMouse = useCallback((e: React.MouseEvent) => {
    if (!ref.current || disabled) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const maxDist = 120;
    if (dist < maxDist) {
      const pull = (1 - dist / maxDist) * 6;
      setOffset({ x: (dx / dist) * pull, y: (dy / dist) * pull });
    } else {
      setOffset({ x: 0, y: 0 });
    }
  }, [disabled]);

  const handleLeave = useCallback(() => {
    setOffset({ x: 0, y: 0 });
  }, []);

  return (
    <button
      ref={ref}
      className={className}
      onClick={onClick}
      disabled={disabled}
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

/* submissions go to /api/apply (Vercel Blob storage) */

const STEPS = [
  { id: 1, label: "About you" },
  { id: 2, label: "Experience" },
  { id: 3, label: "Submit" },
];

export default function Home() {
  const [heroVisible, setHeroVisible] = useState(false);
  const [step, setStep] = useState(0); // 0 = hero, 1-3 = form steps
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  // Form state
  const [twitter, setTwitter] = useState("");
  const [solanaTime, setSolanaTime] = useState("");
  const [volume, setVolume] = useState("");
  const [products, setProducts] = useState("");
  const [whyYou, setWhyYou] = useState("");
  const [wallet, setWallet] = useState("");

  // Focus tracking
  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => {
    requestAnimationFrame(() => setHeroVisible(true));
  }, []);

  // Progress calculation
  const fields = [twitter, solanaTime, volume, products, whyYou, wallet];
  const filled = fields.filter((f) => f.trim().length > 0).length;
  const progress = Math.round((filled / fields.length) * 100);

  // Step validation
  const step1Ready = twitter.trim() && solanaTime.trim();
  const step2Ready = products.trim() && whyYou.trim();
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
      solana_trading_time: solanaTime.trim(),
      monthly_volume: volume.trim(),
      products: products.trim(),
      why_you: whyYou.trim(),
      wallet: wallet.trim(),
    };

    try {
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (result.status === "ok") {
        setStatus("success");
      } else {
        setStatus("error");
      }
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

        <main className="success-page">
          <div className="success-ring">
            <svg width="88" height="88" viewBox="0 0 88 88">
              <circle cx="44" cy="44" r="36" fill="none" stroke="rgba(36,201,141,0.15)" strokeWidth="1.5" />
              <circle cx="44" cy="44" r="36" fill="none" stroke="#24c98d" strokeWidth="1.5"
                strokeDasharray={2 * Math.PI * 36} strokeDashoffset={0}
                style={{ transform: "rotate(-90deg)", transformOrigin: "center", transition: "stroke-dashoffset 1s cubic-bezier(0.22,1,0.36,1)" }}
              />
            </svg>
            <svg className="success-check" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#24c98d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" className="check-draw" />
            </svg>
          </div>
          <h1 className="success-title">You&apos;re in the queue</h1>
          <p className="success-sub">We review applications weekly.<br />If selected, we&apos;ll reach out on X.</p>
          <div className="success-handle">@{twitter.replace("@", "")}</div>
        </main>
      </div>
    );
  }

  /* ── Main Render ── */
  return (
    <div className="app-shell">
      <ParticleCanvas />
      <div className="grain" />

      {/* Progress strip */}
      <div
        className="progress-strip"
        style={{ "--strip-progress": step === 0 ? "0%" : `${progress}%` } as React.CSSProperties}
      />

      {/* Hero */}
      <section className={`hero ${heroVisible ? "hero--visible" : ""}`}>
        <div className="hero-inner">
          <div className="hero-eyebrow s1">
            <span className="hero-dot" />
            SEASON 01
          </div>

          <h1 className="hero-title s2">
            Test what{" "}
            <span className="hero-accent">
              <TextScramble text="ships next" delay={1000} />
            </span>
          </h1>

          <p className="hero-sub s3">
            Get early access to unreleased products built on Meteora.
            <br />Give feedback directly to founders. Get paid in USDC.
          </p>

          <div className="hero-stats s4">
            <div className="hero-stat">
              <span className="hero-stat-value">
                <AnimatedNumber value={7} duration={800} delay={1400} />
              </span>
              <span className="hero-stat-label">OPEN SLOTS</span>
            </div>
            <div className="hero-stat-sep" />
            <div className="hero-stat">
              <span className="hero-stat-value">USDC</span>
              <span className="hero-stat-label">COMPENSATION</span>
            </div>
            <div className="hero-stat-sep" />
            <div className="hero-stat">
              <span className="hero-stat-value">S01</span>
              <span className="hero-stat-label">SEASON</span>
            </div>
          </div>

          <div className="s5">
            <MagneticButton className="btn-apply" onClick={startApplication}>
              Apply now
            </MagneticButton>
          </div>
        </div>
      </section>

      {/* Application */}
      <section id="application" className={`app-section ${step > 0 ? "app-section--active" : ""}`}>
        {step > 0 && (
          <div className="app-container">
            {/* Step progress bar */}
            <div className="step-bar">
              {STEPS.map((s, i) => (
                <button
                  key={s.id}
                  className={`step-item ${step === s.id ? "step-item--active" : ""} ${step > s.id ? "step-item--done" : ""}`}
                  onClick={() => {
                    if (s.id <= step) setStep(s.id);
                    else if (s.id === 2 && step1Ready) setStep(2);
                    else if (s.id === 3 && step1Ready && step2Ready) setStep(3);
                  }}
                  disabled={s.id > step && !(s.id === 2 && !!step1Ready) && !(s.id === 3 && !!step1Ready && !!step2Ready)}
                >
                  <span className="step-num">{String(s.id).padStart(2, "0")}</span>
                  <span className="step-label">{s.label}</span>
                </button>
              ))}
              {/* Connecting line */}
              <div className="step-bar-track">
                <div className="step-bar-fill" style={{ width: step === 1 ? "0%" : step === 2 ? "50%" : "100%" }} />
              </div>
            </div>

            {/* Form */}
            <div className="form-area">

              {/* Step 1: About you */}
              {step === 1 && (
                <div className="form-step" key="step1">
                  <h2 className="form-heading">About you</h2>
                  <p className="form-desc">The basics so we know who you are.</p>

                  <div className="form-fields">
                    <div className={`field ${focusedField === "twitter" ? "field--focused" : ""} ${twitter ? "field--filled" : ""}`}>
                      <label htmlFor="twitter" className="field-label">X handle</label>
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
                      <div className={`field ${focusedField === "solanaTime" ? "field--focused" : ""} ${solanaTime ? "field--filled" : ""}`}>
                        <label htmlFor="solanaTime" className="field-label">How long have you been trading on Solana?</label>
                        <input
                          id="solanaTime" type="text" value={solanaTime}
                          onChange={(e) => setSolanaTime(e.target.value)}
                          onFocus={() => setFocusedField("solanaTime")}
                          onBlur={() => setFocusedField(null)}
                          placeholder="e.g. 2 years"
                          className="field-input"
                          autoComplete="off"
                        />
                      </div>
                      <div className={`field ${focusedField === "volume" ? "field--focused" : ""} ${volume ? "field--filled" : ""}`}>
                        <label htmlFor="volume" className="field-label">Monthly volume (USD) <span className="field-opt">optional</span></label>
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
                    <MagneticButton className="btn-next" disabled={!step1Ready} onClick={() => setStep(2)}>
                      Next
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </MagneticButton>
                  </div>
                </div>
              )}

              {/* Step 2: Experience */}
              {step === 2 && (
                <div className="form-step" key="step2">
                  <h2 className="form-heading">Experience</h2>
                  <p className="form-desc">What you use and why you&apos;d be great at this.</p>

                  <div className="form-fields">
                    <div className={`field ${focusedField === "products" ? "field--focused" : ""} ${products ? "field--filled" : ""}`}>
                      <label htmlFor="products" className="field-label">Which Solana products do you use regularly?</label>
                      <textarea
                        id="products" value={products}
                        onChange={(e) => setProducts(e.target.value)}
                        onFocus={() => setFocusedField("products")}
                        onBlur={() => setFocusedField(null)}
                        placeholder="DEXs, lending, LP platforms, wallets, analytics tools..."
                        rows={3} className="field-textarea"
                      />
                    </div>

                    <div className={`field ${focusedField === "whyYou" ? "field--focused" : ""} ${whyYou ? "field--filled" : ""}`}>
                      <label htmlFor="whyYou" className="field-label">Why would you be a good product tester?</label>
                      <textarea
                        id="whyYou" value={whyYou}
                        onChange={(e) => setWhyYou(e.target.value)}
                        onFocus={() => setFocusedField("whyYou")}
                        onBlur={() => setFocusedField(null)}
                        placeholder="What makes your feedback valuable? How do you approach new products?"
                        rows={3} className="field-textarea"
                      />
                    </div>
                  </div>

                  <div className="form-actions">
                    <button className="btn-back" onClick={() => setStep(1)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                      Back
                    </button>
                    <MagneticButton className="btn-next" disabled={!step2Ready} onClick={() => setStep(3)}>
                      Next
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </MagneticButton>
                  </div>
                </div>
              )}

              {/* Step 3: Submit */}
              {step === 3 && (
                <div className="form-step" key="step3">
                  <h2 className="form-heading">Almost done</h2>
                  <p className="form-desc">Your wallet for compensation. That&apos;s it.</p>

                  <div className="form-fields">
                    <div className={`field ${focusedField === "wallet" ? "field--focused" : ""} ${wallet ? "field--filled" : ""}`}>
                      <label htmlFor="wallet" className="field-label">Solana wallet address</label>
                      <input
                        id="wallet" type="text" value={wallet}
                        onChange={(e) => setWallet(e.target.value)}
                        onFocus={() => setFocusedField("wallet")}
                        onBlur={() => setFocusedField(null)}
                        placeholder="Your Solana public key"
                        className="field-input field-mono"
                        autoComplete="off"
                      />
                    </div>
                  </div>

                  <div className="form-actions">
                    <button className="btn-back" onClick={() => setStep(2)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                      Back
                    </button>
                    <MagneticButton
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
                    </MagneticButton>
                  </div>

                  {status === "error" && (
                    <p className="form-error">Something went wrong. Try again.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="footer">
        <span className="footer-brand">RECON SQUAD</span>
        <span className="footer-sep" />
        <span className="footer-tag">by Meteora</span>
      </footer>
    </div>
  );
}
