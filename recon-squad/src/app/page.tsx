"use client";

import { useEffect } from "react";
import InterestForm from "./interest-form";

export default function Home() {
  useEffect(() => {
    // Intersection Observer for scroll reveals
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

      {/* Hero */}
      <section className="hero">
        <div className="container">
          <div className="hero-reveal hero-reveal-d1">
            <div className="status-pill" style={{ marginBottom: 32 }}>
              <span className="status-dot" />
              <span>Season 01 open</span>
            </div>
          </div>

          <div className="hero-reveal hero-reveal-d2 hero-eyebrow">
            METECOX
          </div>

          <h1 className="hero-reveal hero-reveal-d2 hero-title">
            Shape what<br />
            <span className="highlight">ships next.</span>
          </h1>

          <p className="hero-reveal hero-reveal-d3 hero-sub">
            10 testers get early access to unreleased Meteora products.
            Structured feedback, direct to founders, paid in USDC.
          </p>

          <div className="hero-reveal hero-reveal-d4">
            <a href="#apply" className="hero-cta">
              Apply now
              <span style={{ fontSize: 16 }}>&#8595;</span>
            </a>
          </div>
        </div>
      </section>

      {/* What you get */}
      <section className="section">
        <div className="container">
          <div className="reveal-element">
            <span className="section-eyebrow">What you get</span>
            <h2 className="section-title">
              Not a survey.<br />A direct line.
            </h2>
            <p className="section-desc">
              Recon Squad members test products before anyone else and give
              feedback that shapes what ships. Founders listen because the
              feedback is structured, specific, and from real users.
            </p>
          </div>

          <div className="reveal-element card-grid">
            <div className="feature-card stagger-child">
              <div className="card-icon">&#9889;</div>
              <div className="card-tag live">LIVE</div>
              <h4>Early access</h4>
              <p>Test unreleased products weeks before public launch. DLMM features, vault strategies, new pool types.</p>
            </div>
            <div className="feature-card stagger-child">
              <div className="card-icon">&#128172;</div>
              <h4>Direct to founders</h4>
              <p>Your feedback goes straight to the teams building. No middlemen, no support tickets, no void.</p>
            </div>
            <div className="feature-card stagger-child">
              <div className="card-icon">&#128176;</div>
              <div className="card-tag usdc">USDC</div>
              <h4>Compensation</h4>
              <p>USDC per testing round plus Liquidity NFTs. Quality feedback is worth paying for.</p>
            </div>
            <div className="feature-card stagger-child">
              <div className="card-icon">&#127942;</div>
              <h4>Reputation</h4>
              <p>Build a track record as a product scout. Top testers get priority for future seasons and ecosystem roles.</p>
            </div>
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* How it works */}
      <section className="section">
        <div className="container">
          <div className="reveal-element">
            <span className="section-eyebrow">How it works</span>
            <h2 className="section-title">Apply. Test. Ship.</h2>
          </div>

          <div className="reveal-element steps">
            <div className="step stagger-child">
              <div className="step-num">01</div>
              <div>
                <h4>Apply</h4>
                <p>Tell us what you use on Meteora and why you would be a good tester. 10 slots: 7 traders, 3 creators.</p>
              </div>
            </div>
            <div className="step stagger-child">
              <div className="step-num">02</div>
              <div>
                <h4>Get selected</h4>
                <p>We review weekly. If you are selected, you will hear from us on X with onboarding details.</p>
              </div>
            </div>
            <div className="step stagger-child">
              <div className="step-num">03</div>
              <div>
                <h4>Test products</h4>
                <p>Get access to unreleased features. Use them like you normally would. Break things. Find edges.</p>
              </div>
            </div>
            <div className="step stagger-child">
              <div className="step-num">04</div>
              <div>
                <h4>Submit feedback</h4>
                <p>Structured feedback prompts help you give high-signal input. Not essays -- focused observations that founders can act on.</p>
              </div>
            </div>
            <div className="step stagger-child">
              <div className="step-num">05</div>
              <div>
                <h4>Get paid</h4>
                <p>USDC compensation per round, plus Liquidity NFTs for consistent contributors.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* Callout */}
      <section className="section">
        <div className="container">
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
        <div className="container">
          <div className="form-wrapper">
            <div className="reveal-element" style={{ textAlign: "center", marginBottom: 48 }}>
              <span className="section-eyebrow">Apply</span>
              <h2 className="section-title" style={{ marginTop: 12 }}>
                Join Recon Squad
              </h2>
              <p className="section-desc" style={{ margin: "0 auto" }}>
                Season 01 is open. 10 slots total.
              </p>
            </div>

            <div className="reveal-element">
              <InterestForm />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>MetEcoX by Meteora</p>
        </div>
      </footer>
    </>
  );
}
