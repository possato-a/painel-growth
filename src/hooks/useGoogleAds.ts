import { useQuery } from '@tanstack/react-query';
import type {
  GadsOverviewResponse,
  GadsCampaignsResponse,
  GadsAdGroupsResponse,
  GadsAdsResponse,
} from '@/types/gads';
import type { DateRange } from '@/types/meta';

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

export function useGadsOverview(range: DateRange) {
  return useQuery<GadsOverviewResponse>({
    queryKey: ['gads', 'overview', dateKey(range)],
    queryFn: () => fetchJson<GadsOverviewResponse>(`/api/gads/overview?${dateParams(range)}`),
    staleTime: 5 * 60 * 1000,
  });
}

export function useGadsCampaigns(range: DateRange) {
  return useQuery<GadsCampaignsResponse>({
    queryKey: ['gads', 'campaigns', dateKey(range)],
    queryFn: () => fetchJson<GadsCampaignsResponse>(`/api/gads/campaigns?${dateParams(range)}`),
    staleTime: 5 * 60 * 1000,
  });
}

export function useGadsAdGroups(campaignId: string | null, range: DateRange) {
  return useQuery<GadsAdGroupsResponse>({
    queryKey: ['gads', 'adgroups', campaignId, dateKey(range)],
    queryFn: () =>
      fetchJson<GadsAdGroupsResponse>(
        `/api/gads/campaigns/${campaignId}/adgroups?${dateParams(range)}`
      ),
    enabled: Boolean(campaignId),
    staleTime: 5 * 60 * 1000,
  });
}

export function useGadsAds(adGroupId: string | null, range: DateRange) {
  return useQuery<GadsAdsResponse>({
    queryKey: ['gads', 'ads', adGroupId, dateKey(range)],
    queryFn: () =>
      fetchJson<GadsAdsResponse>(
        `/api/gads/adgroups/${adGroupId}/ads?${dateParams(range)}`
      ),
    enabled: Boolean(adGroupId),
    staleTime: 5 * 60 * 1000,
  });
}
