import { useState, useMemo } from 'react';
import { useGadsOverview, useGadsCampaigns } from '@/hooks/useGoogleAds';
import { GadsOverviewCards } from './GadsOverviewCards';
import { GadsSpendChart } from './GadsSpendChart';
import { GadsCampaignsTable } from './GadsCampaignsTable';
import { DateRangeSelector } from '@/components/DateRangeSelector';
import { RefreshControl } from '@/components/RefreshControl';
import type { DateRange } from '@/types/meta';

type StatusFilter = 'all' | 'ENABLED' | 'PAUSED' | 'REMOVED';

export function GoogleAdsPage() {
  const [dateRange, setDateRange]         = useState<DateRange>('last_30d');
  const [statusFilter, setStatusFilter]   = useState<StatusFilter>('all');
  const [expandedCampaignId, setExpanded] = useState<string | null>(null);

  const overview   = useGadsOverview(dateRange);
  const campaigns  = useGadsCampaigns(dateRange);

  const filteredCampaigns = useMemo(() => {
    const all = campaigns.data?.data ?? [];
    if (statusFilter === 'all') return all;
    return all.filter((c) => c.status === statusFilter);
  }, [campaigns.data, statusFilter]);

  function handleRangeChange(range: DateRange) {
    setDateRange(range);
    setExpanded(null);
  }

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <div className="sticky top-0 z-10 bg-notion-bg-secondary border-b border-notion-border px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-notion-text-primary tracking-tight">
              Google Ads
            </h1>
            <span className="text-xs font-medium text-notion-text-secondary bg-notion-bg-primary border border-notion-border px-2.5 py-1 rounded-sm">
              CA · Franquia Be Honest
            </span>
          </div>
          <div className="flex items-center gap-2">
            <RefreshControl />

            {/* Status filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="text-sm text-notion-text-primary bg-notion-bg-primary border border-notion-border px-3 py-1.5 rounded appearance-none pr-7 hover:bg-notion-bg-tertiary transition-colors duration-[120ms] cursor-pointer"
              >
                <option value="all">Todos os status</option>
                <option value="ENABLED">Ativo</option>
                <option value="PAUSED">Pausado</option>
                <option value="REMOVED">Removido</option>
              </select>
              <svg className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-notion-text-secondary" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
              </svg>
            </div>

            <DateRangeSelector value={dateRange} onChange={handleRangeChange} />
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div className="px-8 py-6 space-y-6">
        <section>
          <GadsOverviewCards data={overview.data?.data} isLoading={overview.isLoading} />
        </section>

        <section>
          <GadsSpendChart data={overview.data?.data} isLoading={overview.isLoading} />
        </section>

        <section>
          <GadsCampaignsTable
            campaigns={filteredCampaigns}
            isLoading={campaigns.isLoading}
            error={campaigns.error}
            expandedId={expandedCampaignId}
            onExpand={setExpanded}
            datePreset={dateRange}
          />
        </section>
      </div>
    </div>
  );
}
