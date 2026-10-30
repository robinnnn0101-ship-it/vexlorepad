import type { NextApiRequest, NextApiResponse } from 'next';

export type TokenomicsCommitments = {
  pairWithVexlorebot?: boolean;
  scannerGatedFees?: boolean;
  graduationRitual?: boolean;
  loreLockedSupply?: boolean;
  volumeToLore?: boolean;
  earlyExitPenalty?: boolean;
  earlyExitPercent?: number;
};

export type LaunchRecord = {
  mint: string;
  name: string;
  symbol: string;
  description?: string;
  website?: string;
  twitter?: string;
  telegram?: string;
  createdAt: string;
  tokenomics?: TokenomicsCommitments;
};

const RAW_URL =
  'https://raw.githubusercontent.com/robinnnn0101-ship-it/vexlorepad/main/public/launches.json';
const API_URL =
  'https://api.github.com/repos/robinnnn0101-ship-it/vexlorepad/contents/public/launches.json';

async function readLaunches(): Promise<LaunchRecord[]> {
  try {
    const res = await fetch(RAW_URL + '?t=' + Date.now(), { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

async function writeLaunches(launches: LaunchRecord[]) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return false;

  const meta = await fetch(API_URL, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' },
  });
  if (!meta.ok) return false;
  const { sha } = await meta.json();

  const content = Buffer.from(JSON.stringify(launches, null, 2)).toString('base64');
  const put = await fetch(API_URL, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: 'Add launch',
      content,
      sha,
      branch: 'main',
    }),
  });
  return put.ok;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const launches = await readLaunches();
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
      tokenomics: body.tokenomics,
    };

    const launches = await readLaunches();
    if (!launches.some((l) => l.mint === record.mint)) {
      launches.unshift(record);
      await writeLaunches(launches.slice(0, 100));
    }

    return res.status(200).json({ ok: true, launch: record });
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).end();
}
