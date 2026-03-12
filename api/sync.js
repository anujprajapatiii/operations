import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  // CORS for same-origin
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'GET') {
      // Fetch all data for a passphrase
      const pass = req.query.pass;
      if (!pass) return res.status(400).json({ error: 'Missing passphrase' });

      const storeKey = 'ops:' + pass;
      const data = await kv.get(storeKey);
      return res.status(200).json({ data: data || {} });
    }

    if (req.method === 'POST') {
      const { pass, key, value } = req.body;
      if (!pass || !key) return res.status(400).json({ error: 'Missing pass or key' });

      const storeKey = 'ops:' + pass;
      const existing = (await kv.get(storeKey)) || {};
      existing[key] = value;
      await kv.set(storeKey, existing);
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    // If KV is not configured, return graceful error
    return res.status(503).json({ error: 'Sync unavailable', detail: e.message });
  }
}
