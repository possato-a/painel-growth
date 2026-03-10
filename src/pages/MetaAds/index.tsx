import { useState, useMemo } from 'react';
import { useOverview, useCampaigns } from '@/hooks/useMetaAds';
import { OverviewCards } from './OverviewCards';
import { SpendChart } from './SpendChart';
import { CampaignsTable } from './CampaignsTable';
import { DateRangeSelector } from '@/components/DateRangeSelector';
import { RefreshControl } from '@/components/RefreshControl';
import { StatusFilter, matchesStatusFilter, type StatusFilterValue } from '@/components/StatusFilter';
import type { DateRange } from '@/types/meta';

export function MetaAdsPage() {
  const [dateRange, setDateRange] = useState<DateRange>('last_30d');
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>('all');
  const [expandedCampaignId, setExpandedCampaignId] = useState<string | null>(null);

  const overview = useOverview(dateRange);
  const campaigns = useCampaigns(dateRange);

  const filteredCampaigns = useMemo(
    () => (campaigns.data?.data ?? []).filter((c) => matchesStatusFilter(c.effective_status, statusFilter)),
    [campaigns.data, statusFilter]
  );

  function handleExpandCampaign(id: string | null) {
    setExpandedCampaignId(id);
  }

  function handleRangeChange(range: DateRange) {
    setDateRange(range);
    setExpandedCampaignId(null);
  }

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <div className="sticky top-0 z-10 bg-notion-bg-secondary border-b border-notion-border px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-notion-text-primary tracking-tight">
              Meta Ads
            </h1>
            <span className="text-xs font-medium text-notion-text-secondary bg-notion-bg-primary border border-notion-border px-2.5 py-1 rounded-sm">
              CA · Franquia Be Honest
            </span>
          </div>
          <div className="flex items-center gap-2">
            <RefreshControl />
            <StatusFilter value={statusFilter} onChange={setStatusFilter} />
            <DateRangeSelector value={dateRange} onChange={handleRangeChange} />
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div className="px-8 py-6 space-y-6">
        <section>
          <OverviewCards
            data={overview.data?.data}
            isLoading={overview.isLoading}
          />
        </section>

        <section>
          <SpendChart
            data={overview.data?.data}
            isLoading={overview.isLoading}
          />
        </section>

        <section>
          <CampaignsTable
            campaigns={filteredCampaigns}
            isLoading={campaigns.isLoading}
            error={campaigns.error}
            expandedId={expandedCampaignId}
            onExpand={handleExpandCampaign}
            datePreset={dateRange}
          />
        </section>
      </div>
    </div>
  );
}
