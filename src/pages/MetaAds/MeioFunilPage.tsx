import { useState, useMemo } from 'react';
import { ArrowUp, ArrowDown, Image } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useCampaigns, useAdsAll } from '@/hooks/useMetaAds';
import { DateRangeSelector } from '@/components/DateRangeSelector';
import { StatusFilter, matchesStatusFilter, type StatusFilterValue } from '@/components/StatusFilter';
import { classifyFunnelStage, classifyAdMidFunnelType, MID_LABELS } from '@/lib/classify';
import { fmtCurrency, fmtCompact, fmtPct, fmtNumber } from '@/lib/formatters';
import { Badge, statusToBadgeVariant, statusLabel } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import type { DatePreset, Ad } from '@/types/meta';
import type { MidFunnelType } from '@/lib/classify';

const TYPE_COLORS: Record<MidFunnelType, string> = {
  webinar: '#2383E2',
  comunidade: '#787774',
  simulador: '#37352F',
  outro: '#9B9A97',
};

const TYPE_EMOJIS: Record<MidFunnelType, string> = {
  webinar: '📡',
  comunidade: '👥',
  simulador: '🧮',
  outro: '📋',
};

const MID_TYPES: MidFunnelType[] = ['webinar', 'comunidade', 'simulador'];

interface TypeAgg {
  spend: number;
  impressions: number;
  clicks: number;
  reach: number;
  ctr: number;
  cpm: number;
  cpc: number;
  count: number; // number of ads
}

function buildAgg(ads: Ad[]): TypeAgg {
  let spend = 0, impressions = 0, clicks = 0, reach = 0;
  let wCtr = 0, wCpm = 0, wCpc = 0, totalSpend = 0;

  for (const ad of ads) {
    const ins = ad.insights?.data?.[0];
    if (!ins) continue;
    const s = Number(ins.spend || 0);
    spend += s;
    impressions += Number(ins.impressions || 0);
    clicks += Number(ins.clicks || 0);
    reach += Number(ins.reach || 0);
    wCtr += Number(ins.ctr || 0) * s;
    wCpm += Number(ins.cpm || 0) * s;
    wCpc += Number(ins.cpc || 0) * s;
    totalSpend += s;
  }

  return {
    spend,
    impressions,
    clicks,
    reach,
    ctr: totalSpend > 0 ? wCtr / totalSpend : 0,
    cpm: totalSpend > 0 ? wCpm / totalSpend : 0,
    cpc: totalSpend > 0 ? wCpc / totalSpend : 0,
    count: ads.length,
  };
}

interface TypeCardProps {
  type: MidFunnelType;
  agg: TypeAgg;
  avgCtr: number;
  avgCpc: number;
}

function TypeCard({ type, agg, avgCtr, avgCpc }: TypeCardProps) {
  const color = TYPE_COLORS[type];
  const ctrDiff = avgCtr > 0 ? ((agg.ctr - avgCtr) / avgCtr) * 100 : 0;
  const cpcDiff = avgCpc > 0 ? ((agg.cpc - avgCpc) / avgCpc) * 100 : 0;

  return (
    <div className="bg-notion-bg-primary rounded shadow-notion-md p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider mb-0.5" style={{ color }}>
            {MID_LABELS[type]}
          </div>
          <p className="text-xs text-notion-text-tertiary">{agg.count} anúncio{agg.count !== 1 ? 's' : ''}</p>
        </div>
        <div
          className="w-8 h-8 rounded flex items-center justify-center text-base flex-shrink-0"
          style={{ background: `${color}15` }}
        >
          {TYPE_EMOJIS[type]}
        </div>
      </div>

      <div>
        <p className="text-2xl font-bold text-notion-text-primary tabular-nums">
          {fmtCurrency(agg.spend)}
        </p>
        <p className="text-xs text-notion-text-tertiary mt-0.5">{fmtCompact(agg.impressions)} impressões</p>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-2 border-t border-notion-border">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-notion-text-tertiary font-medium">Cliques</p>
          <p className="text-sm text-notion-text-primary tabular-nums">{fmtNumber(agg.clicks)}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-notion-text-tertiary font-medium">CPM</p>
          <p className="text-sm text-notion-text-primary tabular-nums">{fmtCurrency(agg.cpm)}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-notion-text-tertiary font-medium">CTR</p>
          <div className="flex items-center gap-1">
            <p className="text-sm text-notion-text-primary tabular-nums">{fmtPct(agg.ctr)}</p>
            {agg.spend > 0 && (
              <span
                className="flex items-center text-[10px] font-medium"
                style={{ color: ctrDiff >= 0 ? '#0F7B6C' : '#E03E3E' }}
              >
                {ctrDiff >= 0 ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
                {Math.abs(ctrDiff).toFixed(0)}%
              </span>
            )}
          </div>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-notion-text-tertiary font-medium">CPC</p>
          <div className="flex items-center gap-1">
            <p className="text-sm text-notion-text-primary tabular-nums">{fmtCurrency(agg.cpc)}</p>
            {agg.spend > 0 && (
              <span
                className="flex items-center text-[10px] font-medium"
                style={{ color: cpcDiff <= 0 ? '#0F7B6C' : '#E03E3E' }}
              >
                {cpcDiff <= 0 ? <ArrowDown size={10} /> : <ArrowUp size={10} />}
                {Math.abs(cpcDiff).toFixed(0)}%
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

type SortKey = 'name' | 'spend' | 'impressions' | 'clicks' | 'ctr' | 'cpm' | 'cpc';
type SortDir = 'asc' | 'desc';

function AdsTable({ ads }: { ads: Ad[] }) {
  const [sortKey, setSortKey] = useState<SortKey>('spend');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const sorted = useMemo(() => {
    return [...ads].sort((a, b) => {
      let aVal: number | string = 0;
      let bVal: number | string = 0;
      if (sortKey === 'name') {
        aVal = a.name.toLowerCase();
        bVal = b.name.toLowerCase();
      } else {
        aVal = Number(a.insights?.data?.[0]?.[sortKey] ?? 0);
        bVal = Number(b.insights?.data?.[0]?.[sortKey] ?? 0);
      }
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [ads, sortKey, sortDir]);

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('desc'); }
  }

  function Th({ label, k, align = 'right' }: { label: string; k: SortKey; align?: 'left' | 'right' }) {
    const active = sortKey === k;
    return (
      <th
        className={`px-3 py-2.5 text-xs font-medium text-notion-text-secondary cursor-pointer select-none whitespace-nowrap hover:text-notion-text-primary transition-colors duration-[120ms] text-${align}`}
        onClick={() => handleSort(k)}
      >
        <span className={`inline-flex items-center gap-1 ${align === 'right' ? 'flex-row-reverse' : ''}`}>
          {label}
          {active && (
            sortDir === 'asc'
              ? <ArrowUp size={10} className="text-notion-primary" />
              : <ArrowDown size={10} className="text-notion-primary" />
          )}
        </span>
      </th>
    );
  }

  return (
    <div className="bg-notion-bg-primary rounded shadow-notion-md overflow-hidden">
      <div className="px-5 py-4 border-b border-notion-border flex items-center gap-3">
        <h3 className="text-sm font-semibold text-notion-text-primary">Anúncios de Meio de Funil</h3>
        <span className="text-xs text-notion-text-tertiary bg-notion-bg-secondary px-2 py-0.5 rounded-sm border border-notion-border">
          {ads.length}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-notion-border bg-notion-bg-secondary/50">
              <Th label="Anúncio" k="name" align="left" />
              <th className="px-3 py-2.5 text-left text-xs font-medium text-notion-text-secondary whitespace-nowrap">Tipo</th>
              <th className="px-3 py-2.5 text-left text-xs font-medium text-notion-text-secondary whitespace-nowrap">Status</th>
              <Th label="Investimento" k="spend" />
              <Th label="Impressões" k="impressions" />
              <Th label="Cliques" k="clicks" />
              <Th label="CTR" k="ctr" />
              <Th label="CPM" k="cpm" />
              <Th label="CPC" k="cpc" />
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 && (
              <tr>
                <td colSpan={9} className="px-5 py-8 text-sm text-notion-text-tertiary text-center">
                  Nenhum anúncio de meio de funil no período.
                </td>
              </tr>
            )}
            {sorted.map((ad) => {
              const ins = ad.insights?.data?.[0];
              const type = classifyAdMidFunnelType(ad);
              const color = TYPE_COLORS[type];
              return (
                <tr
                  key={ad.id}
                  className="border-b border-notion-border hover:bg-notion-bg-secondary transition-colors duration-[60ms]"
                >
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2.5">
                      {ad.creative?.thumbnail_url ? (
                        <img
                          src={ad.creative.thumbnail_url}
                          alt={ad.name}
                          className="w-8 h-8 rounded object-cover flex-shrink-0 bg-notion-bg-secondary"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded bg-notion-bg-secondary flex items-center justify-center flex-shrink-0">
                          <Image size={12} className="text-notion-text-tertiary" />
                        </div>
                      )}
                      <p className="text-sm text-notion-text-primary truncate max-w-[200px]" title={ad.name}>
                        {ad.name}
                      </p>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <span
                      className="text-xs font-medium px-1.5 py-0.5 rounded-sm whitespace-nowrap"
                      style={{ background: `${color}18`, color }}
                    >
                      {MID_LABELS[type]}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <Badge variant={statusToBadgeVariant(ad.effective_status)}>
                      {statusLabel(ad.effective_status)}
                    </Badge>
                  </td>
                  <td className="px-3 py-2.5 text-right text-sm tabular-nums">{ins ? fmtCurrency(ins.spend) : '—'}</td>
                  <td className="px-3 py-2.5 text-right text-sm tabular-nums">{ins ? fmtCompact(ins.impressions) : '—'}</td>
                  <td className="px-3 py-2.5 text-right text-sm tabular-nums">{ins ? fmtNumber(ins.clicks) : '—'}</td>
                  <td className="px-3 py-2.5 text-right text-sm tabular-nums">{ins ? fmtPct(ins.ctr) : '—'}</td>
                  <td className="px-3 py-2.5 text-right text-sm tabular-nums">{ins ? fmtCurrency(ins.cpm) : '—'}</td>
                  <td className="px-3 py-2.5 text-right text-sm tabular-nums">{ins ? fmtCurrency(ins.cpc) : '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function MeioFunilPage() {
  const [datePreset, setDatePreset] = useState<DatePreset>('last_30d');
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>('all');

  const { data: campaignsData, isLoading: loadingCampaigns } = useCampaigns(datePreset);
  const { data: adsData, isLoading: loadingAds } = useAdsAll(datePreset);

  const isLoading = loadingCampaigns || loadingAds;

  // IDs of meio-funil campaigns
  const meioCampaignIds = useMemo(() => {
    const campaigns = campaignsData?.data ?? [];
    return new Set(
      campaigns.filter((c) => classifyFunnelStage(c) === 'meio').map((c) => c.id)
    );
  }, [campaignsData]);

  // All ads from meio-funil campaigns, filtered by status
  const meioAds = useMemo(() => {
    const ads = adsData?.data ?? [];
    return ads.filter(
      (ad) =>
        meioCampaignIds.has(ad.campaign_id) &&
        matchesStatusFilter(ad.effective_status, statusFilter)
    );
  }, [adsData, meioCampaignIds, statusFilter]);

  // Group ads by creative type
  const adsByType = useMemo(() => {
    const map: Record<MidFunnelType, Ad[]> = {
      webinar: [],
      comunidade: [],
      simulador: [],
      outro: [],
    };
    for (const ad of meioAds) {
      map[classifyAdMidFunnelType(ad)].push(ad);
    }
    return map;
  }, [meioAds]);

  // Aggregate metrics per type
  const aggByType = useMemo(() => {
    const result = {} as Record<MidFunnelType, TypeAgg>;
    for (const type of [...MID_TYPES, 'outro' as MidFunnelType]) {
      result[type] = buildAgg(adsByType[type]);
    }
    return result;
  }, [adsByType]);

  // Weighted avg CTR/CPC for delta arrows
  const { avgCtr, avgCpc } = useMemo(() => {
    const active = MID_TYPES.filter((t) => aggByType[t].spend > 0);
    if (active.length === 0) return { avgCtr: 0, avgCpc: 0 };
    const totalSpend = active.reduce((s, t) => s + aggByType[t].spend, 0);
    return {
      avgCtr: totalSpend > 0
        ? active.reduce((s, t) => s + aggByType[t].ctr * aggByType[t].spend, 0) / totalSpend
        : 0,
      avgCpc: totalSpend > 0
        ? active.reduce((s, t) => s + aggByType[t].cpc * aggByType[t].spend, 0) / totalSpend
        : 0,
    };
  }, [aggByType]);

  const chartData = useMemo(
    () =>
      MID_TYPES.filter((t) => aggByType[t].spend > 0).map((t) => ({
        name: MID_LABELS[t],
        Investimento: Number(aggByType[t].spend.toFixed(2)),
        CTR: Number(aggByType[t].ctr.toFixed(2)),
        CPC: Number(aggByType[t].cpc.toFixed(2)),
      })),
    [aggByType]
  );

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-10 bg-notion-bg-secondary border-b border-notion-border px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-notion-text-primary tracking-tight">
              Meio de Funil Detalhado
            </h1>
            <span className="text-xs font-medium text-notion-text-secondary bg-notion-bg-primary border border-notion-border px-2.5 py-1 rounded-sm">
              Meta Ads · Franquia Be Honest
            </span>
          </div>
          <div className="flex items-center gap-2">
            <StatusFilter value={statusFilter} onChange={setStatusFilter} />
            <DateRangeSelector value={datePreset} onChange={setDatePreset} />
          </div>
        </div>
      </div>

      <div className="px-8 py-6 space-y-6">
        {/* Summary cards por tipo de anúncio */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="bg-notion-bg-primary rounded shadow-notion-md p-5 space-y-3">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-8 w-36" />
                <div className="grid grid-cols-2 gap-2">
                  {[0, 1, 2, 3].map((j) => <Skeleton key={j} className="h-6" />)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {MID_TYPES.map((type) => (
              <TypeCard
                key={type}
                type={type}
                agg={aggByType[type]}
                avgCtr={avgCtr}
                avgCpc={avgCpc}
              />
            ))}
          </div>
        )}

        {/* Comparative chart */}
        {!isLoading && chartData.length > 0 && (
          <div className="bg-notion-bg-primary rounded shadow-notion-md p-5">
            <h3 className="text-sm font-semibold text-notion-text-primary mb-4">
              Comparativo por Tipo de Anúncio
            </h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData} margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E9E9E7" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#9B9A97' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 11, fill: '#9B9A97' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 11, fill: '#9B9A97' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip
                  contentStyle={{ fontSize: 12, border: '1px solid #E9E9E7', borderRadius: 6 }}
                  formatter={(value: number, name: string) =>
                    name === 'Investimento'
                      ? [`R$ ${value.toFixed(2)}`, name]
                      : [`${value.toFixed(2)}%`, name]
                  }
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar yAxisId="left" dataKey="Investimento" fill="#2383E2" radius={[3, 3, 0, 0]} />
                <Bar yAxisId="right" dataKey="CTR" fill="#787774" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Detailed ads table */}
        {!isLoading && <AdsTable ads={meioAds} />}

        {!isLoading && meioAds.length === 0 && meioCampaignIds.size > 0 && (
          <div className="bg-notion-bg-primary rounded shadow-notion-md px-5 py-10 text-center">
            <p className="text-sm text-notion-text-tertiary">
              Nenhum anúncio encontrado para o filtro selecionado.
            </p>
          </div>
        )}

        {!isLoading && meioCampaignIds.size === 0 && (
          <div className="bg-notion-bg-primary rounded shadow-notion-md px-5 py-10 text-center">
            <p className="text-sm text-notion-text-tertiary">
              Nenhuma campanha de meio de funil encontrada para o período selecionado.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
