import InterestForm from "./interest-form";

export default function Home() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center px-6 py-20">
      <div className="relative z-10 w-full max-w-[460px]">

        {/* Header */}
        <div className="reveal flex items-center justify-between mb-6">
          <div className="flex items-baseline gap-3">
            <span className="text-[14px] font-semibold tracking-[1.8px] uppercase"
              style={{ color: "var(--color-text)" }}>
              MetEcoX
            </span>
            <span className="text-[11px] tracking-[0.8px]"
              style={{ color: "var(--color-text-dim)" }}>
              by Meteora
            </span>
          </div>
          <div className="slot-pill">
            <span className="relative flex h-[5px] w-[5px]">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-40"
                style={{ background: "var(--color-accent)" }} />
              <span className="dot" />
            </span>
            <span>Open</span>
          </div>
        </div>

        {/* Accent line */}
        <div className="reveal reveal-d1 accent-line mb-14" />

        {/* Title */}
        <div className="reveal reveal-d2 mb-4">
          <h1 className="text-[36px] font-semibold leading-[1.1] tracking-[-0.8px]"
            style={{ color: "var(--color-text)" }}>
            Shape what ships next.
          </h1>
        </div>

        {/* Description */}
        <div className="reveal reveal-d3 mb-12">
          <p className="text-[15px] leading-[1.8]"
            style={{ color: "var(--color-text-secondary)" }}>
            10 testers get early access to unreleased Meteora products.
            Give structured feedback directly to founders. Get paid in USDC.
          </p>
        </div>

        {/* Form */}
        <div className="reveal reveal-d4">
          <InterestForm />
        </div>

        {/* Footer */}
        <div className="reveal reveal-d6 mt-20 pt-6 border-t"
          style={{ borderColor: "var(--color-line)" }}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] tracking-[1px] uppercase"
              style={{ color: "var(--color-text-dim)" }}>
              Season 01
            </span>
            <span className="text-[11px] tracking-[0.5px]"
              style={{ color: "var(--color-text-dim)" }}>
              USDC + Liquidity NFTs
            </span>
          </div>
        </div>

      </div>
    </main>
  );
}
