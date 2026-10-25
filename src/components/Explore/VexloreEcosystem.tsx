import { useEffect, useState } from 'react';
import { TrendingUp, Rocket, Shield, Zap, ExternalLink } from 'lucide-react';

type Launch = {
  mint: string;
  name: string;
  symbol: string;
  createdAt: string;
};

export const VexloreEcosystem = () => {
  const [solPrice, setSolPrice] = useState<number | null>(null);
  const [solChange, setSolChange] = useState<number | null>(null);
  const [launches, setLaunches] = useState<Launch[]>([]);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const res = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd&include_24hr_change=true'
        );
        const data = await res.json();
        setSolPrice(data.solana?.usd ?? null);
        setSolChange(data.solana?.usd_24h_change ?? null);
      } catch {}
    };
    fetchPrice();
    const id = setInterval(fetchPrice, 60_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const load = async () => {
      // local launches (this browser)
      let local: Launch[] = [];
      try {
        const raw = localStorage.getItem('vexlorepad_launches');
        if (raw) local = JSON.parse(raw);
      } catch {}

      // shared launches (visible to everyone)
      let remote: Launch[] = [];
      try {
        const res = await fetch('/api/launches');
        const data = await res.json();
        remote = data.launches || [];
      } catch {}
      // fallback to public file
      if (remote.length === 0) {
        try {
          const res = await fetch('https://raw.githubusercontent.com/robinnnn0101-ship-it/vexlorepad/main/public/launches.json?t=' + Date.now());
          const data = await res.json();
          if (Array.isArray(data)) remote = data;
        } catch {}
      }

      // merge, unique by mint, newest first
      const map = new Map<string, Launch>();
      [...remote, ...local].forEach((l) => map.set(l.mint, l));
      setLaunches(Array.from(map.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 12));
    };
    load();
  }, []);

  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card/60 p-4 backdrop-blur-sm md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <img src="/vexlore-logo.jpg" alt="Vexlore" className="h-10 w-10 rounded-xl logo-glow" />
          <div>
            <h1 className="text-lg font-bold tracking-tight">Vexlorepad</h1>
            <p className="text-xs text-muted-foreground">Launch · Explore · Trade on Solana</p>
          </div>
        </div>

        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">SOL</span>
            <span className="font-semibold">
              {solPrice != null ? `$${solPrice.toFixed(2)}` : '...'}
            </span>
            {solChange != null && (
              <span className={solChange >= 0 ? 'text-green-500' : 'text-red-500'}>
                {solChange >= 0 ? '+' : ''}{solChange.toFixed(2)}%
              </span>
            )}
          </div>
          <a
            href="/create-pool"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Launch Token
          </a>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Highlight icon={Rocket} title="Launch" desc="Pump.fun curve" />
        <Highlight icon={Zap} title="VEXLOREBOT" desc="Optional pairing" />
        <Highlight icon={Shield} title="Non-custodial" desc="You sign every tx" />
        <Highlight icon={TrendingUp} title="Live Feed" desc="New / Soon / Bonded" />
      </div>

      <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Launched on Vexlorepad</h2>
          <span className="text-xs text-muted-foreground">{launches.length} shown</span>
        </div>

        {launches.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            No launches yet. Tokens launched through this site will appear here.
          </p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {launches.map((l) => (
              <div key={l.mint} className="rounded-lg border border-border/60 bg-card/60 p-3 text-xs">
                <div className="flex items-center justify-between mb-2">
                  <div className="min-w-0">
                    <div className="font-semibold truncate">{l.symbol}</div>
                    <div className="truncate text-muted-foreground">{l.name}</div>
                  </div>
                  <button
                    onClick={() => navigator.clipboard.writeText(l.mint)}
                    className="ml-2 rounded px-2 py-1 text-[10px] border border-border hover:bg-muted"
                    title="Copy CA"
                  >
                    Copy CA
                  </button>
                </div>
                <div className="font-mono text-[10px] text-muted-foreground truncate mb-2">{l.mint}</div>
                <div className="h-10 flex items-end gap-0.5">
                  {[3,5,4,6,5,7,6,8,7,9].map((h,i) => (
                    <div key={i} className="flex-1 bg-primary/40 rounded-sm" style={{height: h*4}} />
                  ))}
                </div>
                <div className="mt-2 flex gap-3 text-[10px] text-muted-foreground">
                  <span>Supply: 1B</span>
                  <span>Decimals: 6</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

function Highlight({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-border/60 bg-card/40 p-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <div>
        <div className="text-xs font-medium">{title}</div>
        <div className="text-[0.7rem] text-muted-foreground">{desc}</div>
      </div>
    </div>
  );
}
