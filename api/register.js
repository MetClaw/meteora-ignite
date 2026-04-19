import { put, list } from '@vercel/blob';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = req.body;

    // Bot check: honeypot
    if (data.website_url) {
      return res.status(200).json({ status: 'ok' });
    }

    // Bot check: token must exist
    if (!data._token) {
      return res.status(200).json({ status: 'ok' });
    }

    // Validation
    if (!data.name || !data.email || !data.project || !data.challenge) {
      return res.status(400).json({ status: 'error', message: 'Missing required fields.' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      return res.status(400).json({ status: 'error', message: 'Invalid email.' });
    }

    // Sanitize
    const sanitize = (val, max) => {
      if (!val) return '';
      let s = String(val).substring(0, max || 1000);
      s = s.replace(/^[\s]*[=+\-@]/, ' ');
      return s;
    };

    const submission = {
      timestamp: new Date().toISOString(),
      name: sanitize(data.name, 200),
      role: sanitize(data.role, 100),
      project: sanitize(data.project, 200),
      website: sanitize(data.website, 500),
      stage: sanitize(data.stage, 50),
      helpNeeds: sanitize(data.helpNeeds, 500),
      challenge: sanitize(data.challenge, 2000),
      questions: sanitize(data.questions, 2000),
      l2interest: sanitize(data.l2interest, 50),
      email: sanitize(data.email, 320),
    };

    // Store as individual JSON blob
    const filename = `registrations/${Date.now()}-${submission.name.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
    await put(filename, JSON.stringify(submission, null, 2), {
      contentType: 'application/json',
      access: 'public',
    });

    return res.status(200).json({ status: 'ok' });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ status: 'error', message: 'Submission failed.' });
  }
}
