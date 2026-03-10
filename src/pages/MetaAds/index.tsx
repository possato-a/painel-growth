import { useState } from 'react';
import { useOverview, useCampaigns } from '@/hooks/useMetaAds';
import { OverviewCards } from './OverviewCards';
import { SpendChart } from './SpendChart';
import { CampaignsTable } from './CampaignsTable';
import { DateRangeSelector } from '@/components/DateRangeSelector';
import { RefreshControl } from '@/components/RefreshControl';
import type { DatePreset } from '@/types/meta';

export function MetaAdsPage() {
  const [datePreset, setDatePreset] = useState<DatePreset>('last_30d');
  const [expandedCampaignId, setExpandedCampaignId] = useState<string | null>(null);

  const overview = useOverview(datePreset);
  const campaigns = useCampaigns(datePreset);

  function handleExpandCampaign(id: string | null) {
    setExpandedCampaignId(id);
  }

  function handlePresetSelect(preset: DatePreset) {
    setDatePreset(preset);
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
          <div className="flex items-center gap-3">
            <RefreshControl />
            <DateRangeSelector value={datePreset} onChange={handlePresetSelect} />
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div className="px-8 py-6 space-y-6">
        {/* KPI Cards */}
        <section>
          <OverviewCards
            data={overview.data?.data}
            isLoading={overview.isLoading}
          />
        </section>

        {/* Spend Chart */}
        <section>
          <SpendChart
            data={overview.data?.data}
            isLoading={overview.isLoading}
          />
        </section>

        {/* Campaigns Table */}
        <section>
          <CampaignsTable
            campaigns={campaigns.data?.data ?? []}
            isLoading={campaigns.isLoading}
            error={campaigns.error}
            expandedId={expandedCampaignId}
            onExpand={handleExpandCampaign}
            datePreset={datePreset}
          />
        </section>
      </div>
    </div>
  );
}
