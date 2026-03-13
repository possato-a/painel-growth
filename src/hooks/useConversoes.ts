import { useQuery } from '@tanstack/react-query';
import type { DateRange } from '@/types/meta';

export interface ConvPage {
  page: string;
  label: string;
  leads: number;
  campaigns: string[];   // Meta campaign IDs that drove traffic here
  spend: number;
  clicks: number;
  landing_page_views: number;
  cpl: number | null;
  openRate: number | null;   // landing_page_views / clicks
  convRate: number | null;   // leads / landing_page_views
}

export interface ConvCampaign {
  metaId: string;
  metaName: string;
  metaStatus: string;
  spend: number;
  clicks: number;
  impressions: number;
  ctr: number;
  landing_page_views: number;
  leads: number;
  lps: string[];          // LP URLs declared in Meta ad creatives
  cpl: number | null;
  openRate: number | null;   // landing_page_views / clicks
  convRate: number | null;   // leads / landing_page_views
}

export interface MetaNoLeads {
  id: string;
  name: string;
  status: string;
  spend: number;
  clicks: number;
  impressions: number;
  ctr: number;
  cpc: number;
  cpm: number;
  lps: string[];
}

export interface ConversoesData {
  period: { since: string; until: string };
  totals: {
    leads: number;
    spend: number;
    clicks: number;
    landing_page_views: number;
    cpl: number | null;
    openRate: number | null;
    convRate: number | null;
  };
  byPage: ConvPage[];
  byCampaign: ConvCampaign[];
  metaNoLeads: MetaNoLeads[];
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err?.error?.message ?? err?.error ?? res.statusText);
  }
  return res.json() as Promise<T>;
}

function dateParams(range: DateRange): string {
  if (typeof range === 'string') return `date_preset=${range}`;
  return `since=${range.since}&until=${range.until}`;
}

function dateKey(range: DateRange): string {
  if (typeof range === 'string') return range;
  return `${range.since}__${range.until}`;
}

export function useConversoes(range: DateRange) {
  return useQuery<ConversoesData>({
    queryKey: ['conversoes', dateKey(range)],
    queryFn: () => fetchJson<ConversoesData>(`/api/conversoes?${dateParams(range)}`),
    staleTime: 5 * 60 * 1000,
  });
}
