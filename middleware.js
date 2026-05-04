// Edge middleware — locks both metworkshops.vercel.app and met-eco-events.vercel.app
// to the showcase only. Other hosts (preview deploys, etc.) pass through normally.
export const config = {
  matcher: '/((?!_next/|_vercel/|favicon\\.ico).*)',
};

export default function middleware(request) {
  const url = new URL(request.url);
  const host = (request.headers.get('host') || '').toLowerCase();

  // Lock the public-facing aliases. Anything else (preview URLs, etc.) passes through.
  const isLockedHost =
    host.startsWith('metworkshops') ||
    host.startsWith('met-eco-events');

  if (!isLockedHost) return;

  const path = url.pathname;

  // Allow the showcase, founder spotlight pages, and shared assets.
  const allowed =
    path === '/showcase.html' ||
    path === '/launch.html' ||
    path === '/metreport-q1-2026.html' ||
    path.startsWith('/d/') ||
    path.startsWith('/audio/') ||
    path.startsWith('/video/') ||
    path.startsWith('/logos/') ||
    path.startsWith('/api/') ||
    /\.(png|jpg|jpeg|svg|ico|json|css|js|mp3|mp4|webp|woff2?)$/i.test(path);

  if (allowed) return;

  // Anything else (including / and other .html pages) → redirect to showcase.
  url.pathname = '/showcase.html';
  return Response.redirect(url.toString(), 302);
}
