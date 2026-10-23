import { useEffect, useState } from 'react';
import { TrendingUp, Rocket, Shield, Zap } from 'lucide-react';

export const VexloreEcosystem = () => {
  const [solPrice, setSolPrice] = useState<number | null>(null);
  const [solChange, setSolChange] = useState<number | null>(null);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const res = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd&include_24hr_change=true'
        );
        const data = await res.json();
        setSolPrice(data.solana?.usd ?? null);
        setSolChange(data.solana?.usd_24h_change ?? null);
      } catch {
        // silent
      }
    };
    fetchPrice();
    const id = setInterval(fetchPrice, 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="mb-6 space-y-4">
      {/* Top bar: price + ecosystem */}
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

      {/* Ecosystem highlights */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Highlight icon={Rocket} title="Launch" desc="Pump.fun curve" />
        <Highlight icon={Zap} title="VEXLOREBOT" desc="Optional pairing" />
        <Highlight icon={Shield} title="Non-custodial" desc="You sign every tx" />
        <Highlight icon={TrendingUp} title="Live Feed" desc="New / Soon / Bonded" />
      </div>

      {/* Vexlorepad launched section */}
      <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-4">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Launched on Vexlorepad</h2>
          <span className="text-xs text-muted-foreground">Coming soon</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Tokens launched through this site will appear here. Currently showing the live Pump.fun stream below.
        </p>
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
