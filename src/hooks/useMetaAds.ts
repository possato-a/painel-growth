import { useQuery } from '@tanstack/react-query';
import type {
  MetaOverviewResponse,
  MetaCampaignsResponse,
  MetaAdSetsResponse,
  MetaAdsResponse,
  DatePreset,
} from '@/types/meta';

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err?.error?.message ?? err?.error ?? res.statusText);
  }
  return res.json() as Promise<T>;
}

export function useOverview(datePreset: DatePreset) {
  return useQuery<MetaOverviewResponse>({
    queryKey: ['meta', 'overview', datePreset],
    queryFn: () =>
      fetchJson<MetaOverviewResponse>(`/api/meta/overview?date_preset=${datePreset}`),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCampaigns(datePreset: DatePreset) {
  return useQuery<MetaCampaignsResponse>({
    queryKey: ['meta', 'campaigns', datePreset],
    queryFn: () =>
      fetchJson<MetaCampaignsResponse>(`/api/meta/campaigns?date_preset=${datePreset}`),
    staleTime: 5 * 60 * 1000,
  });
}

export function useAdSets(campaignId: string | null, datePreset: DatePreset) {
  return useQuery<MetaAdSetsResponse>({
    queryKey: ['meta', 'adsets', campaignId, datePreset],
    queryFn: () =>
      fetchJson<MetaAdSetsResponse>(
        `/api/meta/campaigns/${campaignId}/adsets?date_preset=${datePreset}`
      ),
    enabled: Boolean(campaignId),
    staleTime: 5 * 60 * 1000,
  });
}

export function useAds(adsetId: string | null, datePreset: DatePreset) {
  return useQuery<MetaAdsResponse>({
    queryKey: ['meta', 'ads', adsetId, datePreset],
    queryFn: () =>
      fetchJson<MetaAdsResponse>(
        `/api/meta/adsets/${adsetId}/ads?date_preset=${datePreset}`
      ),
    enabled: Boolean(adsetId),
    staleTime: 5 * 60 * 1000,
  });
}

export function useAdSetsAll(datePreset: DatePreset) {
  return useQuery<MetaAdSetsResponse>({
    queryKey: ['meta', 'adsets-all', datePreset],
    queryFn: () =>
      fetchJson<MetaAdSetsResponse>(`/api/meta/adsets-all?date_preset=${datePreset}`),
    staleTime: 5 * 60 * 1000,
  });
}

export function useAdsAll(datePreset: DatePreset) {
  return useQuery<MetaAdsResponse>({
    queryKey: ['meta', 'ads-all', datePreset],
    queryFn: () =>
      fetchJson<MetaAdsResponse>(`/api/meta/ads?date_preset=${datePreset}`),
    staleTime: 5 * 60 * 1000,
  });
}
