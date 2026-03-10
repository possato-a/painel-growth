import { useQuery } from '@tanstack/react-query';
import type {
  MetaOverviewResponse,
  MetaCampaignsResponse,
  MetaAdSetsResponse,
  MetaAdsResponse,
  DateRange,
} from '@/types/meta';

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

// Stable cache key for DateRange
function dateKey(range: DateRange): string {
  if (typeof range === 'string') return range;
  return `${range.since}__${range.until}`;
}

export function useOverview(range: DateRange) {
  return useQuery<MetaOverviewResponse>({
    queryKey: ['meta', 'overview', dateKey(range)],
    queryFn: () =>
      fetchJson<MetaOverviewResponse>(`/api/meta/overview?${dateParams(range)}`),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCampaigns(range: DateRange) {
  return useQuery<MetaCampaignsResponse>({
    queryKey: ['meta', 'campaigns', dateKey(range)],
    queryFn: () =>
      fetchJson<MetaCampaignsResponse>(`/api/meta/campaigns?${dateParams(range)}`),
    staleTime: 5 * 60 * 1000,
  });
}

export function useAdSets(campaignId: string | null, range: DateRange) {
  return useQuery<MetaAdSetsResponse>({
    queryKey: ['meta', 'adsets', campaignId, dateKey(range)],
    queryFn: () =>
      fetchJson<MetaAdSetsResponse>(
        `/api/meta/campaigns/${campaignId}/adsets?${dateParams(range)}`
      ),
    enabled: Boolean(campaignId),
    staleTime: 5 * 60 * 1000,
  });
}

export function useAds(adsetId: string | null, range: DateRange) {
  return useQuery<MetaAdsResponse>({
    queryKey: ['meta', 'ads', adsetId, dateKey(range)],
    queryFn: () =>
      fetchJson<MetaAdsResponse>(
        `/api/meta/adsets/${adsetId}/ads?${dateParams(range)}`
      ),
    enabled: Boolean(adsetId),
    staleTime: 5 * 60 * 1000,
  });
}

export function useAdSetsAll(range: DateRange) {
  return useQuery<MetaAdSetsResponse>({
    queryKey: ['meta', 'adsets-all', dateKey(range)],
    queryFn: () =>
      fetchJson<MetaAdSetsResponse>(`/api/meta/adsets-all?${dateParams(range)}`),
    staleTime: 5 * 60 * 1000,
  });
}

export function useAdsAll(range: DateRange) {
  return useQuery<MetaAdsResponse>({
    queryKey: ['meta', 'ads-all', dateKey(range)],
    queryFn: () =>
      fetchJson<MetaAdsResponse>(`/api/meta/ads?${dateParams(range)}`),
    staleTime: 5 * 60 * 1000,
  });
}
