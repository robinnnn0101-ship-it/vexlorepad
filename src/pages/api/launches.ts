import type { NextApiRequest, NextApiResponse } from 'next';

export type LaunchRecord = {
  mint: string;
  name: string;
  symbol: string;
  description?: string;
  website?: string;
  twitter?: string;
  telegram?: string;
  createdAt: string;
};

// In-memory store for the current serverless instance.
// For permanent multi-user storage, connect Supabase / Vercel KV.
const launches: LaunchRecord[] = [];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return res.status(200).json({ launches: launches.slice(0, 50) });
  }

  if (req.method === 'POST') {
    const body = req.body as Partial<LaunchRecord>;
    if (!body.mint || !body.name || !body.symbol) {
      return res.status(400).json({ error: 'mint, name, and symbol are required' });
    }

    const record: LaunchRecord = {
      mint: body.mint,
      name: body.name,
      symbol: body.symbol,
      description: body.description,
      website: body.website,
      twitter: body.twitter,
      telegram: body.telegram,
      createdAt: new Date().toISOString(),
    };

    // avoid duplicates
    if (!launches.some((l) => l.mint === record.mint)) {
      launches.unshift(record);
    }

    return res.status(200).json({ ok: true, launch: record });
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).end();
}
