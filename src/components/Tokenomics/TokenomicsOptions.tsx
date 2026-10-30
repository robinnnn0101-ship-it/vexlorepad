import { Checkbox } from '@/components/ui/Checkbox';
import { Input } from '@/components/ui/input';
import { TokenomicsCommitments } from '@/lib/recordLaunch';

type Props = {
  value: TokenomicsCommitments;
  onChange: (next: TokenomicsCommitments) => void;
};

export function TokenomicsOptions({ value, onChange }: Props) {
  const set = (patch: Partial<TokenomicsCommitments>) => onChange({ ...value, ...patch });

  return (
    <div className="bg-card/50 backdrop-blur-sm rounded-xl p-8 border border-border/50 shadow-lg space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">Vexlore Tokenomics</h2>
        <p className="text-xs text-muted-foreground">
          Commitments only. Pump.fun curve and liquidity stay untouched. Vexlorebot monitors and executes from a separate fee wallet.
        </p>
      </div>

      <div className="space-y-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <Checkbox
            checked={!!value.scannerGatedFees}
            onCheckedChange={(c) => set({ scannerGatedFees: c === true })}
          />
          <div>
            <div className="text-sm font-medium">Scanner-gated fee reduction</div>
            <div className="text-xs text-muted-foreground">Clean Vexlore history → lower platform fee</div>
          </div>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <Checkbox
            checked={!!value.graduationRitual}
            onCheckedChange={(c) => set({ graduationRitual: c === true })}
          />
          <div>
            <div className="text-sm font-medium">Graduation ritual</div>
            <div className="text-xs text-muted-foreground">On bond: small VEX buy+burn + graduated badge</div>
          </div>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <Checkbox
            checked={!!value.loreLockedSupply}
            onCheckedChange={(c) => set({ loreLockedSupply: c === true })}
          />
          <div>
            <div className="text-sm font-medium">Lore-locked supply</div>
            <div className="text-xs text-muted-foreground">Extra tranche unlocks only if lore score stays high</div>
          </div>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <Checkbox
            checked={!!value.volumeToLore}
            onCheckedChange={(c) => set({ volumeToLore: c === true })}
          />
          <div>
            <div className="text-sm font-medium">Volume-to-lore conversion</div>
            <div className="text-xs text-muted-foreground">% of volume buys VEX locked to lore score</div>
          </div>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <Checkbox
            checked={!!value.earlyExitPenalty}
            onCheckedChange={(c) => set({ earlyExitPenalty: c === true })}
          />
          <div>
            <div className="text-sm font-medium">Early-exit penalty</div>
            <div className="text-xs text-muted-foreground">Deployer early sell → portion redirected to VEX buyback</div>
          </div>
        </label>

        {value.earlyExitPenalty && (
          <div className="pl-8 space-y-1">
            <label className="text-xs text-muted-foreground">Redirect % on early sell</label>
            <Input
              type="number"
              min={5}
              max={50}
              value={value.earlyExitPercent ?? 20}
              onChange={(e) => set({ earlyExitPercent: Number(e.target.value) })}
              className="h-9 w-32"
            />
          </div>
        )}
      </div>
    </div>
  );
}
