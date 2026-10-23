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

      // server launches (current instance)
      let remote: Launch[] = [];
      try {
        const res = await fetch('/api/launches');
        const data = await res.json();
        remote = data.launches || [];
      } catch {}

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
              <a
                key={l.mint}
                href={`https://pump.fun/${l.mint}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-lg border border-border/60 bg-card/60 px-3 py-2 text-xs hover:border-primary/40"
              >
                <div className="min-w-0">
                  <div className="font-medium truncate">{l.symbol}</div>
                  <div className="truncate text-muted-foreground">{l.name}</div>
                </div>
                <ExternalLink className="ml-2 h-3 w-3 shrink-0 text-muted-foreground" />
              </a>
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
