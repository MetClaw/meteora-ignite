import { put } from "@vercel/blob";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Bot check: honeypot
    if (data.website_url) {
      return Response.json({ status: "ok" });
    }

    // Validation
    if (!data.twitter || !data.solana_trading_time) {
      return Response.json(
        { status: "error", message: "Missing required fields." },
        { status: 400 }
      );
    }

    // Sanitize
    const sanitize = (val: unknown, max = 1000): string => {
      if (!val) return "";
      let s = String(val).substring(0, max);
      s = s.replace(/^[\s]*[=+\-@]/, " ");
      return s;
    };

    const submission = {
      timestamp: new Date().toISOString(),
      twitter: sanitize(data.twitter, 200),
      solana_trading_time: sanitize(data.solana_trading_time, 200),
      monthly_volume: sanitize(data.monthly_volume, 100),
      products: sanitize(data.products, 2000),
      why_you: sanitize(data.why_you, 2000),
      wallet: sanitize(data.wallet, 100),
    };

    const handle = submission.twitter.replace(/[^a-zA-Z0-9_]/g, "_");
    const filename = `recon-applications/${Date.now()}-${handle}.json`;

    await put(filename, JSON.stringify(submission, null, 2), {
      contentType: "application/json",
      access: "public",
    });

    return Response.json({ status: "ok" });
  } catch (err) {
    console.error("Application error:", err);
    return Response.json(
      { status: "error", message: "Submission failed." },
      { status: 500 }
    );
  }
}
