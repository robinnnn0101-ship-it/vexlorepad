import { useQueryClient } from '@tanstack/react-query';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { categorySortBy, categorySortDir, createPoolSorter } from '@/components/Explore/pool-utils';
import { ApeQueries, GemsTokenListQueryArgs, QueryData } from '@/components/Explore/queries';
import { ExploreTab, TokenListSortByField, normalizeSortByField, Pool, Launchpad } from '@/components/Explore/types';
import { TokenCardList } from '@/components/TokenCard/TokenCardList';
import { useExploreGemsTokenList } from '@/hooks/useExploreGemsTokenList';
import { EXPLORE_FIXED_TIMEFRAME, useExplore } from '@/contexts/ExploreProvider';
import { isHoverableDevice, useBreakpoint } from '@/lib/device';
import { PausedIndicator } from './PausedIndicator';
import { usePumpStream } from '@/contexts/PumpStreamProvider';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

type ExploreColumnProps = {
  tab: ExploreTab;
  onSelectToken?: (mint: string) => void;
};

export const ExploreTabTitleMap: Record<ExploreTab, string> = {
  [ExploreTab.NEW]: `New`,
  [ExploreTab.GRADUATING]: `Soon`,
  [ExploreTab.GRADUATED]: `Bonded`,
};

// Approximate SOL price in USD. Update periodically or fetch dynamically later.
const SOL_PRICE_USD = 160;

function toHttpUri(uri: string | undefined | null): string | null {
  if (!uri) return null;
  if (uri.startsWith('ipfs://')) {
    const cid = uri.replace('ipfs://', '').replace(/^ipfs\//, '');
    return `https://ipfs.io/ipfs/${cid}`;
  }
  if (uri.startsWith('ar://')) {
    return `https://arweave.net/${uri.replace('ar://', '')}`;
  }
  return uri;
}

export const ExploreColumn: React.FC<ExploreColumnProps> = ({ tab, onSelectToken }) => {
  const { pausedTabs, setTabPaused, request } = useExplore();
  const isPaused = pausedTabs[tab];
  const setIsPaused = useCallback(
    (paused: boolean) => setTabPaused(tab, paused),
    [setTabPaused, tab]
  );

  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="flex flex-col h-full lg:h-[calc(100vh-300px)]">
      <div className="flex flex-col p-3 max-lg:hidden gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-x-2">
            <h2 className="font-bold text-neutral-300">{ExploreTabTitleMap[tab]}</h2>
            {isPaused && <PausedIndicator />}
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search token..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-neutral-900/50 border-neutral-800 h-9 text-xs"
          />
        </div>
      </div>

      <div className="relative flex-1 border-neutral-850 text-xs lg:border-t h-full">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-2 bg-gradient-to-b from-neutral-950 to-transparent" />
        <TokenCardListContainer
          tab={tab}
          request={request}
          isPaused={isPaused}
          setIsPaused={setIsPaused}
          searchTerm={searchTerm}
          onSelectToken={onSelectToken}
        />
      </div>
    </div>
  );
};

type TokenCardListContainerProps = {
  tab: ExploreTab;
  request: Required<GemsTokenListQueryArgs>;
  isPaused: boolean;
  setIsPaused: (isPaused: boolean) => void;
  searchTerm: string;
  onSelectToken?: (mint: string) => void;
};

const timeframe = EXPLORE_FIXED_TIMEFRAME;

const TokenCardListContainer: React.FC<TokenCardListContainerProps> = memo(
  ({ tab, request, isPaused, setIsPaused, searchTerm, onSelectToken }) => {
    const breakpoint = useBreakpoint();
    const isMobile = breakpoint === 'md' || breakpoint === 'sm' || breakpoint === 'xs';
    const listRef = useRef<HTMLDivElement>(null);

    const { subscribeNewTokens, lastCreateEvent, lastTradeEvent, isConnected, subscribeTokenTrades } = usePumpStream();
    const [pumpPools, setPumpPools] = useState<Pool[]>([]);

    useEffect(() => {
      if (isConnected) {
        subscribeNewTokens();
      }
    }, [isConnected, subscribeNewTokens]);

    const resolveMetadataImage = useCallback(async (uri: string | undefined) => {
      const httpUri = toHttpUri(uri);
      if (!httpUri) return { image: null, socials: null };
      try {
        const response = await fetch(httpUri);
        if (!response.ok) return { image: null, socials: null };
        const data = await response.json();
        let image = data?.image || data?.logo || data?.imageUrl || null;
        if (image) image = toHttpUri(image) || image;

        const socials = {
          website: data?.website || data?.extensions?.website || null,
          twitter: data?.twitter || data?.extensions?.twitter || data?.twitter_url || null,
          telegram: data?.telegram || data?.extensions?.telegram || data?.telegram_url || null,
        };
        return { image, socials };
      } catch {
        return { image: null, socials: null };
      }
    }, []);

    useEffect(() => {
      if (lastCreateEvent) {
        const newPool: Pool = {
          id: lastCreateEvent.mint,
          chain: 'solana',
          dex: 'pump.fun',
          type: 'pump',
          createdAt: new Date().toISOString(),
          bondingCurve: 0,
          volume24h: 0,
          isUnreliable: false,
          updatedAt: new Date().toISOString(),
          baseAsset: {
            id: lastCreateEvent.mint,
            name: lastCreateEvent.name,
            symbol: lastCreateEvent.symbol,
            icon: toHttpUri(lastCreateEvent.uri) || undefined,
            decimals: 6,
            tokenProgram: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
            mcap: lastCreateEvent.marketCapSol * SOL_PRICE_USD,
            liquidity: lastCreateEvent.vSolInBondingCurve * SOL_PRICE_USD,
            usdPrice: 0,
            launchpad: Launchpad.PUMPFUN,
          },
          streamed: true,
        };

        setPumpPools((prev) => {
          if (prev.some((p) => p.id === newPool.id)) return prev;
          return [newPool, ...prev];
        });

        subscribeTokenTrades([lastCreateEvent.mint]);

        (async () => {
          const { image, socials } = await resolveMetadataImage(lastCreateEvent.uri);
          if (!image && !socials) return;
          setPumpPools((prev) =>
            prev.map((pool) =>
              pool.id === lastCreateEvent.mint
                ? {
                    ...pool,
                    baseAsset: {
                      ...pool.baseAsset,
                      icon: image || pool.baseAsset.icon,
                      website: socials?.website || pool.baseAsset.website,
                      twitter: socials?.twitter || pool.baseAsset.twitter,
                      telegram: socials?.telegram || pool.baseAsset.telegram,
                    },
                  }
                : pool
            )
          );
        })();
      }
    }, [lastCreateEvent, subscribeTokenTrades, resolveMetadataImage]);

    useEffect(() => {
      if (lastTradeEvent) {
        setPumpPools((prev) =>
          prev.map((pool) => {
            if (pool.id === lastTradeEvent.mint) {
              return {
                ...pool,
                updatedAt: new Date().toISOString(),
                bondingCurve: Math.min(100, (lastTradeEvent.marketCapSol / 85) * 100),
                baseAsset: {
                  ...pool.baseAsset,
                  mcap: lastTradeEvent.marketCapSol * SOL_PRICE_USD,
                  liquidity: lastTradeEvent.vSolInBondingCurve * SOL_PRICE_USD,
                },
              };
            }
            return pool;
          })
        );
      }
    }, [lastTradeEvent]);

    const filteredPumpPools = pumpPools.filter((pool) => {
      const mcapUsd = pool.baseAsset.mcap || 0;
      if (tab === ExploreTab.NEW) return true;
      if (tab === ExploreTab.GRADUATING) return mcapUsd >= 40000 && mcapUsd < 80000;
      if (tab === ExploreTab.GRADUATED) return mcapUsd >= 80000;
      return false;
    });

    const [snapshotData, setSnapshotData] = useState<Pool[]>();

    const handleMouseEnter = useCallback(() => {
      if (!isHoverableDevice()) return;
      if (!isPaused) setSnapshotData([...filteredPumpPools]);
      setIsPaused(true);
    }, [filteredPumpPools, isPaused, setIsPaused]);

    const handleMouseLeave = useCallback(() => {
      if (!isHoverableDevice()) return;
      setIsPaused(false);
    }, [setIsPaused]);

    const handleScroll = useCallback(() => {
      if (!isMobile || !listRef.current) return;
      const top = listRef.current.getBoundingClientRect().top;
      if (top <= 0) {
        if (!isPaused) setSnapshotData([...filteredPumpPools]);
        setIsPaused(true);
      } else {
        setIsPaused(false);
      }
    }, [filteredPumpPools, isPaused, setIsPaused, isMobile]);

    useEffect(() => {
      if (!isMobile) return;
      handleScroll();
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => {
        window.removeEventListener('scroll', handleScroll);
        setIsPaused(false);
      };
    }, [isMobile, setIsPaused, handleScroll]);

    const applyFilters = (pools: Pool[]) => {
      if (!searchTerm) return pools;
      const term = searchTerm.toLowerCase();
      return pools.filter(
        (p) =>
          p.baseAsset.name.toLowerCase().includes(term) ||
          p.baseAsset.symbol.toLowerCase().includes(term) ||
          p.baseAsset.id.toLowerCase().includes(term)
      );
    };

    const filteredFinalData = applyFilters(filteredPumpPools);
    const displayData = isPaused
      ? (snapshotData || []).map((s) => filteredPumpPools.find((p) => p.id === s.id) || s)
      : filteredFinalData;
    const finalDisplayData = isPaused ? applyFilters(displayData) : displayData;

    return (
      <TokenCardList
        ref={listRef}
        data={finalDisplayData}
        status={'success'}
        timeframe={timeframe}
        trackPools
        className="lg:h-0 lg:min-h-full"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onSelectToken={onSelectToken}
      />
    );
  }
);

TokenCardListContainer.displayName = 'TokenCardListContainer';
