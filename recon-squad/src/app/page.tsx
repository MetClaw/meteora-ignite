"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import InterestForm from "./interest-form";

/* ── Text Scramble (Pentagon-style) ── */
const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

function TextScramble({ text, delay = 800 }: { text: string; delay?: number }) {
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
      }, 45);
    }, delay);

    return () => clearTimeout(timer);
  }, [text, delay]);

  return <>{display}</>;
}

/* ── Animated Counter ── */
function AnimatedCounter({ end, suffix = "" }: { end: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 2000;
          const startTime = performance.now();
          function animate(now: number) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(eased * end));
            if (progress < 1) requestAnimationFrame(animate);
          }
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end]);

  return <span ref={ref}>{count}{suffix}</span>;
}

/* ── Cursor Glow ── */
function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onMove(e: MouseEvent) {
      if (glowRef.current) {
        glowRef.current.style.setProperty("--gx", `${e.clientX}px`);
        glowRef.current.style.setProperty("--gy", `${e.clientY}px`);
      }
    }
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return <div ref={glowRef} className="cursor-glow" />;
}

const MARQUEE_ITEMS = [
  "DLMM", "DYNAMIC POOLS", "DYNAMIC VAULTS", "DBC", "DAMM V2",
  "FEE OPTIMIZATION", "BIN LIQUIDITY", "CONCENTRATED LP",
  "TOKEN LAUNCH", "POOL CREATION", "YIELD STRATEGY",
];

const STEPS = [
  {
    num: "01",
    title: "Apply",
    desc: "Tell us what you use on Meteora and what you would change. Takes 2 minutes.",
  },
  {
    num: "02",
    title: "Get selected",
    desc: "We review weekly. Selected testers get onboarded via X. 10 slots total.",
  },
  {
    num: "03",
    title: "Test & feedback",
    desc: "Access unreleased features. Use them like you normally would. Structured prompts for high-signal observations.",
  },
  {
    num: "04",
    title: "Get paid",
    desc: "USDC per testing round plus Liquidity NFTs for consistent contributors.",
  },
];

export default function Home() {
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    // Hero entrance
    requestAnimationFrame(() => setHeroVisible(true));

    // Scroll reveals
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -60px 0px" }
    );

    document.querySelectorAll(".reveal-element").forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Atmosphere */}
      <div className="grain" />
      <div className="ambient" />
      <CursorGlow />

      {/* Orange Strip -- structural anchor */}
      <div className="orange-strip" />

      {/* Hero */}
      <section className={`hero ${heroVisible ? "hero--visible" : ""}`}>
        <div className="container-wide">
          <div className="hero-layout">
            <div className="hero-content">
              <div className="hero-stagger hero-stagger-1">
                <div className="status-pill">
                  <span className="status-dot" />
                  <span>Season 01 open</span>
                </div>
              </div>

              <div className="hero-stagger hero-stagger-1 hero-eyebrow">
                METECOX
              </div>

              <h1 className="hero-stagger hero-stagger-2 hero-title">
                Shape what{" "}
                <span className="hero-serif">
                  <TextScramble text="ships next" delay={1200} />
                </span>
              </h1>

              <p className="hero-stagger hero-stagger-3 hero-sub">
                10 testers get early access to unreleased Meteora ecosystem
                products. Structured feedback, direct to founders.
              </p>

              <div className="hero-stagger hero-stagger-4 hero-actions">
                <a href="#apply" className="btn-primary">
                  Apply now
                </a>
                <a href="#how" className="btn-ghost">
                  How it works
                </a>
              </div>
            </div>

            <div className="hero-metrics">
              <div className="hero-stagger hero-stagger-2 metric-block">
                <span className="metric-value">
                  <AnimatedCounter end={10} />
                </span>
                <span className="metric-label">Testers</span>
              </div>
              <div className="metric-separator" />
              <div className="hero-stagger hero-stagger-3 metric-block">
                <span className="metric-value">
                  <AnimatedCounter end={7} />
                  <span className="metric-small">/3</span>
                </span>
                <span className="metric-label">Traders / Creators</span>
              </div>
              <div className="metric-separator" />
              <div className="hero-stagger hero-stagger-4 metric-block">
                <span className="metric-value">USDC</span>
                <span className="metric-label">Compensation</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee */}
      <div className="marquee-wrap">
        <div className="marquee-track">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} className="marquee-item">
              {item}
              <span className="marquee-dot" />
            </span>
          ))}
        </div>
      </div>

      {/* Capabilities */}
      <section className="section-lg">
        <div className="container-wide">
          <div className="reveal-element">
            <span className="section-eyebrow">What you get</span>
            <h2 className="section-title">
              Not a survey.{" "}
              <span className="title-serif">A direct line.</span>
            </h2>
          </div>

          <div className="reveal-element capability-list">
            <div className="capability stagger-child">
              <span className="capability-num">01</span>
              <div className="capability-content">
                <h4>Early access</h4>
                <p>
                  Test unreleased products weeks before public launch. DLMM
                  features, vault strategies, new pool types.
                </p>
              </div>
              <span className="capability-tag live">LIVE</span>
            </div>
            <div className="capability stagger-child">
              <span className="capability-num">02</span>
              <div className="capability-content">
                <h4>Direct to founders</h4>
                <p>
                  Your feedback goes straight to the teams building. No
                  middlemen, no support tickets, no void.
                </p>
              </div>
            </div>
            <div className="capability stagger-child">
              <span className="capability-num">03</span>
              <div className="capability-content">
                <h4>Compensation</h4>
                <p>
                  USDC per testing round plus Liquidity NFTs. Quality feedback
                  is worth paying for.
                </p>
              </div>
              <span className="capability-tag usdc">USDC</span>
            </div>
            <div className="capability stagger-child">
              <span className="capability-num">04</span>
              <div className="capability-content">
                <h4>Reputation</h4>
                <p>
                  Build a track record as a product scout. Top testers get
                  priority for future seasons and ecosystem roles.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works -- Timeline */}
      <section id="how" className="section-lg">
        <div className="container-wide">
          <div className="reveal-element">
            <span className="section-eyebrow">Process</span>
            <h2 className="section-title">
              Apply. Test.{" "}
              <span className="title-serif">Ship.</span>
            </h2>
          </div>

          <div className="reveal-element timeline">
            {STEPS.map((step, i) => (
              <div key={step.num} className="timeline-item stagger-child">
                <div className="timeline-marker">
                  <span className="timeline-num">{step.num}</span>
                  {i < STEPS.length - 1 && <div className="timeline-line" />}
                </div>
                <div className="timeline-content">
                  <h4>{step.title}</h4>
                  <p>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Callout */}
      <section className="section-sm">
        <div className="container-narrow">
          <div className="reveal-element callout">
            <strong>This is not a bug bounty.</strong> We are looking for
            product thinkers -- people who can articulate what is confusing,
            what is missing, and what would make them use something daily.
            Technical skills help but product intuition matters more.
          </div>
        </div>
      </section>

      {/* Application form */}
      <section id="apply" className="form-section">
        <div className="container-narrow">
          <div className="reveal-element form-header">
            <span className="section-eyebrow">Apply</span>
            <h2 className="section-title" style={{ marginTop: 12 }}>
              Join <span className="title-serif">Recon Squad</span>
            </h2>
            <p className="form-header-sub">
              Season 01 is open. 10 slots total.
            </p>
          </div>

          <div className="reveal-element">
            <InterestForm />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container-wide footer-inner">
          <span className="footer-brand">MetEcoX</span>
          <span className="footer-sep" />
          <span className="footer-sub">by Meteora</span>
        </div>
      </footer>
    </>
  );
}
