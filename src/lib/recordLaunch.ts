export type LaunchPayload = {
  mint: string;
  name: string;
  symbol: string;
  description?: string;
  website?: string;
  twitter?: string;
  telegram?: string;
};

export async function recordLaunch(payload: LaunchPayload) {
  const record = { ...payload, createdAt: new Date().toISOString() };

  // local (this browser)
  try {
    const raw = localStorage.getItem('vexlorepad_launches');
    const list = raw ? JSON.parse(raw) : [];
    if (!list.some((l: any) => l.mint === payload.mint)) {
      list.unshift(record);
      localStorage.setItem('vexlorepad_launches', JSON.stringify(list.slice(0, 50)));
    }
  } catch {}

  // server (best effort)
  try {
    await fetch('/api/launches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {}
}
