export interface GadsMetrics {
  spend: string;            // BRL
  impressions: string;
  clicks: string;
  ctr: string;              // already in % (e.g. "2.50")
  cpm: string;              // BRL
  cpc: string;              // BRL
  conversions: string;
  costPerConversion: string; // BRL
  conversionRate: string;   // already in % (e.g. "5.00")
}

export interface GadsDailyRow {
  date_start: string;        // YYYY-MM-DD
  spend: string;
  impressions: string;
  clicks: string;
  ctr: string;
  cpm: string;
  cpc: string;
  conversions: string;
  conversionRate: string;
}

export interface GadsCampaign {
  id: string;
  name: string;
  status: 'ENABLED' | 'PAUSED' | 'REMOVED';
  channelType: string;
  metrics: GadsMetrics;
}

export interface GadsAdGroup {
  id: string;
  name: string;
  status: string;
  metrics: Omit<GadsMetrics, 'conversionRate'>;
}

export interface GadsAd {
  id: string;
  name: string;
  type: string;
  status: string;
  metrics: Pick<GadsMetrics, 'spend' | 'impressions' | 'clicks' | 'ctr' | 'cpc' | 'conversions'>;
}

export interface GadsOverviewResponse   { data: GadsDailyRow[]; }
export interface GadsCampaignsResponse  { data: GadsCampaign[]; }
export interface GadsAdGroupsResponse   { data: GadsAdGroup[]; }
export interface GadsAdsResponse        { data: GadsAd[]; }
