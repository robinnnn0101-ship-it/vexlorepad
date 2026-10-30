import React from 'react';

import { Pool, TokenListTimeframe } from '../Explore/types';

import { cn } from '@/lib/utils';
import { Skeleton } from '../ui/Skeleton';
import { TrenchesPoolTokenIcon } from '../TokenIcon/TokenIcon';
import { Copyable } from '../ui/Copyable';
import CopyIconSVG from '@/icons/CopyIconSVG';
import { TokenAge } from '../TokenAge';
import { TokenSocials } from '../TokenSocials';
import { TokenCardMcapMetric, TokenCardVolumeMetric } from './TokenCardMetric';
import { TokenomicsBadges } from '@/components/Tokenomics/TokenomicsBadges';
import { useEffect, useState } from 'react';
import { TokenomicsCommitments } from '@/lib/recordLaunch';
// import Link from 'next/link'; // Removed for Dashboard SPA behavior

type TokenCardProps = {
  pool: Pool;
  timeframe: TokenListTimeframe;
  rowRef: (element: HTMLElement | null, poolId: string) => void;
};

export const TokenCard: React.FC<TokenCardProps> = ({ pool, timeframe, rowRef }) => {
  const stats = pool.baseAsset[`stats${timeframe}`];
  const [commitments, setCommitments] = useState<TokenomicsCommitments | undefined>();

  useEffect(() => {
    try {
      const raw = localStorage.getItem('vexlorepad_launches');
      if (!raw) return;
      const list = JSON.parse(raw);
      const match = list.find((l: any) => l.mint === pool.baseAsset.id);
      if (match?.tokenomics) setCommitments(match.tokenomics);
    } catch {}
  }, [pool.baseAsset.id]);

  return (
    <div
      ref={(el) => rowRef(el, pool.id)}
      data-pool-id={pool.id}
      className="relative flex cursor-pointer items-center gap-3 border-b border-border/50 bg-card/50 px-4 py-3 text-xs transition-all duration-200 has-hover:hover:bg-card has-hover:hover:border-border has-hover:hover:shadow-sm"
    >
      <div className="shrink-0">
        <TrenchesPoolTokenIcon width={48} height={48} pool={pool} />
      </div>

      <div className="flex flex-1 flex-col gap-2 overflow-hidden min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="flex items-center gap-1.5 min-w-0">
              <div
                className="whitespace-nowrap text-sm font-bold text-foreground truncate"
                title={pool.baseAsset.symbol}
              >
                {pool.baseAsset.symbol}
              </div>
              
              <div className="flex items-center gap-1 min-w-0" onClick={(e) => e.stopPropagation()}>
                <Copyable
                  name="Address"
                  copyText={pool.baseAsset.id}
                  className="z-[1] flex min-w-0 items-center gap-1 text-[0.7rem] leading-none text-muted-foreground duration-200 hover:text-foreground data-[copied=true]:text-primary"
                >
                  {(copied) => (
                    <>
                      <div className="truncate max-w-[120px]" title={pool.baseAsset.name}>
                        {pool.baseAsset.name}
                      </div>
                      {copied ? (
                        <div className="iconify h-3 w-3 shrink-0 text-primary ph--check-bold" />
                      ) : (
                        <CopyIconSVG className="h-3 w-3 shrink-0 opacity-60" width={12} height={12} />
                      )}
                    </>
                  )}
                </Copyable>
              </div>
            </div>
          </div>

          <div onClick={(e) => e.stopPropagation()} className="shrink-0">
            <TokenSocials className="z-[1]" token={pool.baseAsset} />
          </div>
        </div>

        <TokenomicsBadges commitments={commitments} />

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <TokenAge className="text-[0.7rem] text-muted-foreground" date={pool.createdAt} />
          </div>

          <div className="flex items-center gap-3">
            <TokenCardVolumeMetric buyVolume={stats?.buyVolume} sellVolume={stats?.sellVolume} />
            <TokenCardMcapMetric mcap={pool.baseAsset.mcap} />
          </div>
        </div>
      </div>
    </div>
  );
};

type TokenCardSkeletonProps = React.ComponentPropsWithoutRef<'div'>;

export const TokenCardSkeleton: React.FC<TokenCardSkeletonProps> = ({ className, ...props }) => (
  <div className={cn('border-b border-border/50 bg-card/50 px-4 py-3', className)} {...props}>
    <div className="flex items-center gap-3">
      <div className="shrink-0">
        <Skeleton className="h-12 w-12 rounded-full" />
      </div>

      <div className="flex flex-1 flex-col gap-2 overflow-hidden">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-3.5 w-12" />
        </div>

        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-3 w-16" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-12" />
          </div>
        </div>
      </div>
    </div>
  </div>
);
