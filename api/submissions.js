import { list, head } from '@vercel/blob';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Simple password protection
  const key = req.query.key;
  const validKey = process.env.SUBMISSIONS_KEY || 'metclaw2024';
  if (key !== validKey) {
    return res.status(401).json({ error: 'Unauthorized. Add ?key=YOUR_KEY' });
  }

  try {
    const { blobs } = await list({ prefix: 'registrations/' });

    const submissions = [];
    for (const blob of blobs) {
      const response = await fetch(blob.url);
      const data = await response.json();
      submissions.push(data);
    }

    // Sort newest first
    submissions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Return HTML table for easy viewing
    const html = `<!DOCTYPE html>
<html><head>
<title>Workshop Registrations (${submissions.length})</title>
<style>
  body { font-family: system-ui; background: #0a0a0f; color: #e0e0e0; padding: 2rem; }
  h1 { color: #f54b00; }
  table { border-collapse: collapse; width: 100%; margin-top: 1rem; font-size: 0.85rem; }
  th { background: #1a1a2e; color: #f54b00; text-align: left; padding: 0.75rem; position: sticky; top: 0; }
  td { padding: 0.75rem; border-bottom: 1px solid #1a1a2e; max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  td:hover { white-space: normal; overflow: visible; }
  tr:hover td { background: #12121c; }
  .count { color: #888; font-size: 0.9rem; }
</style>
</head><body>
<h1>Workshop Registrations</h1>
<p class="count">${submissions.length} submission${submissions.length !== 1 ? 's' : ''}</p>
<table>
<tr><th>Time</th><th>Name</th><th>Email</th><th>Role</th><th>Project</th><th>Website</th><th>Stage</th><th>Help Needs</th><th>Challenge</th><th>Questions</th><th>L2</th></tr>
${submissions.map(s => `<tr>
<td>${new Date(s.timestamp).toLocaleString()}</td>
<td>${esc(s.name)}</td>
<td>${esc(s.email)}</td>
<td>${esc(s.role)}</td>
<td>${esc(s.project)}</td>
<td>${esc(s.website)}</td>
<td>${esc(s.stage)}</td>
<td>${esc(s.helpNeeds)}</td>
<td>${esc(s.challenge)}</td>
<td>${esc(s.questions)}</td>
<td>${esc(s.l2interest)}</td>
</tr>`).join('')}
</table>
</body></html>`;

    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(html);
  } catch (err) {
    console.error('Submissions error:', err);
    return res.status(500).json({ error: 'Failed to load submissions.' });
  }
}

function esc(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
