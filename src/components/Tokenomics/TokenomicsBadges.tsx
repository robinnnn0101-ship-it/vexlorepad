import { TokenomicsCommitments } from '@/lib/recordLaunch';

const labels: Record<keyof TokenomicsCommitments, string> = {
  pairWithVexlorebot: 'VEX Paired',
  scannerGatedFees: 'Scanner Fees',
  graduationRitual: 'Grad Ritual',
  loreLockedSupply: 'Lore Locked',
  volumeToLore: 'Vol→Lore',
  earlyExitPenalty: 'Early Exit',
  earlyExitPercent: '',
};

export function TokenomicsBadges({ commitments }: { commitments?: TokenomicsCommitments }) {
  if (!commitments) return null;

  const active = (Object.keys(labels) as (keyof TokenomicsCommitments)[])
    .filter((k) => k !== 'earlyExitPercent' && commitments[k]);

  if (active.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5 mt-1">
      {active.map((k) => (
        <span
          key={k}
          className="inline-flex items-center rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-medium text-primary border border-primary/20"
        >
          {labels[k]}
          {k === 'earlyExitPenalty' && commitments.earlyExitPercent
            ? ` ${commitments.earlyExitPercent}%`
            : ''}
        </span>
      ))}
    </div>
  );
}
