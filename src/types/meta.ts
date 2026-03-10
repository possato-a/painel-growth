export interface MetaInsights {
  impressions: string;
  clicks: string;
  spend: string;
  reach: string;
  cpm: string;
  cpc: string;
  ctr: string;
  date_start?: string;
  date_stop?: string;
}

export interface MetaDailyInsight extends MetaInsights {
  date_start: string;
  date_stop: string;
}

export interface Campaign {
  id: string;
  name: string;
  status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED' | 'DELETED';
  effective_status: string;
  objective: string;
  insights?: { data: MetaInsights[] };
}

export interface AdSet {
  id: string;
  name: string;
  campaign_id: string;
  status: string;
  effective_status: string;
  insights?: { data: MetaInsights[] };
}

export interface Ad {
  id: string;
  name: string;
  adset_id: string;
  campaign_id: string;
  status: string;
  effective_status: string;
  creative?: {
    id: string;
    name?: string;
    title?: string;
    body?: string;
    thumbnail_url?: string;
  };
  insights?: { data: MetaInsights[] };
}

export type DatePreset =
  | 'today'
  | 'last_7d'
  | 'last_14d'
  | 'last_30d'
  | 'this_month'
  | 'last_month';

export interface MetaOverviewResponse {
  data: MetaDailyInsight[];
  paging?: {
    cursors?: { before: string; after: string };
    next?: string;
  };
}

export interface MetaCampaignsResponse {
  data: Campaign[];
  paging?: {
    cursors?: { before: string; after: string };
    next?: string;
  };
}

export interface MetaAdSetsResponse {
  data: AdSet[];
  paging?: {
    cursors?: { before: string; after: string };
    next?: string;
  };
}

export interface MetaAdsResponse {
  data: Ad[];
  paging?: {
    cursors?: { before: string; after: string };
    next?: string;
  };
}
