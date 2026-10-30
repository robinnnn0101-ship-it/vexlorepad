/**
 * Vexlore Tokenomics Watcher
 * Polls launches and logs/triggers actions for committed tokenomics.
 * Does NOT touch Pump.fun liquidity. Runs as a separate process.
 *
 * Usage:
 *   npx tsx scripts/vexlore-tokenomics-watcher.ts
 *
 * Env:
 *   LAUNCHES_URL (default: raw launches.json)
 *   POLL_MS (default: 30000)
 */

const LAUNCHES_URL = process.env.LAUNCHES_URL ||
  "https://raw.githubusercontent.com/robinnnn0101-ship-it/vexlorepad/main/public/launches.json";
const POLL_MS = Number(process.env.POLL_MS || 30000);

type Tokenomics = {
  pairWithVexlorebot?: boolean;
  scannerGatedFees?: boolean;
  graduationRitual?: boolean;
  loreLockedSupply?: boolean;
  volumeToLore?: boolean;
  earlyExitPenalty?: boolean;
  earlyExitPercent?: number;
};

type Launch = {
  mint: string;
  name: string;
  symbol: string;
  createdAt: string;
  tokenomics?: Tokenomics;
};

const seen = new Set<string>();

async function fetchLaunches(): Promise<Launch[]> {
  try {
    const res = await fetch(LAUNCHES_URL + "?t=" + Date.now());
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function handle(launch: Launch) {
  const t = launch.tokenomics;
  if (!t) return;

  console.log(`[${new Date().toISOString()}] ${launch.symbol} (${launch.mint.slice(0, 8)}...)`);

  if (t.pairWithVexlorebot) console.log("  → VEX paired");
  if (t.scannerGatedFees) console.log("  → Scanner-gated fees active");
  if (t.graduationRitual) console.log("  → Watch for bond → VEX buy+burn");
  if (t.loreLockedSupply) console.log("  → Lore-locked tranche (monitor score)");
  if (t.volumeToLore) console.log("  → Volume → VEX lore pool");
  if (t.earlyExitPenalty) {
    console.log(`  → Early-exit penalty ${t.earlyExitPercent ?? 20}% → VEX buyback`);
  }
}

async function tick() {
  const launches = await fetchLaunches();
  for (const l of launches) {
    if (seen.has(l.mint)) continue;
    seen.add(l.mint);
    if (l.tokenomics) handle(l);
  }
}

console.log("Vexlore tokenomics watcher started");
console.log("Polling", LAUNCHES_URL);
tick();
setInterval(tick, POLL_MS);
