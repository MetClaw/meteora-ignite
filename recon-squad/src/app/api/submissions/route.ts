import { list } from "@vercel/blob";
import { NextRequest } from "next/server";

function esc(str: string): string {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

interface Submission {
  timestamp: string;
  twitter: string;
  solana_trading_time: string;
  monthly_volume: string;
  products: string;
  why_you: string;
  wallet: string;
}

export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get("key");
  const validKey = process.env.SUBMISSIONS_KEY || "metclaw2024";

  if (!key || key !== validKey) {
    return Response.json(
      { error: "Unauthorized. Add ?key=YOUR_KEY" },
      { status: 401 }
    );
  }

  try {
    const { blobs } = await list({ prefix: "recon-applications/" });

    const submissions: Submission[] = [];
    for (const blob of blobs) {
      const response = await fetch(blob.url);
      const data = await response.json();
      submissions.push(data);
    }

    submissions.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    const html = `<!DOCTYPE html>
<html><head>
<title>Recon Squad Applications (${submissions.length})</title>
<style>
  body { font-family: system-ui; background: #060609; color: #e0e0e0; padding: 2rem; }
  h1 { color: #f54b00; font-weight: 300; }
  .count { color: #888; font-size: 0.9rem; }
  table { border-collapse: collapse; width: 100%; margin-top: 1rem; font-size: 0.85rem; }
  th { background: #12121c; color: #f54b00; text-align: left; padding: 0.75rem; position: sticky; top: 0; }
  td { padding: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.04); max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  td:hover { white-space: normal; overflow: visible; }
  tr:hover td { background: rgba(255,255,255,0.02); }
</style>
</head><body>
<h1>Recon Squad Applications</h1>
<p class="count">${submissions.length} application${submissions.length !== 1 ? "s" : ""}</p>
<table>
<tr><th>Time</th><th>X Handle</th><th>Trading Time</th><th>Volume</th><th>Products</th><th>Why You</th><th>Wallet</th></tr>
${submissions
  .map(
    (s) => `<tr>
<td>${new Date(s.timestamp).toLocaleString()}</td>
<td>${esc(s.twitter)}</td>
<td>${esc(s.solana_trading_time)}</td>
<td>${esc(s.monthly_volume)}</td>
<td>${esc(s.products)}</td>
<td>${esc(s.why_you)}</td>
<td>${esc(s.wallet)}</td>
</tr>`
  )
  .join("")}
</table>
</body></html>`;

    return new Response(html, {
      headers: { "Content-Type": "text/html" },
    });
  } catch (err) {
    console.error("Submissions error:", err);
    return Response.json(
      { error: "Failed to load submissions." },
      { status: 500 }
    );
  }
}
