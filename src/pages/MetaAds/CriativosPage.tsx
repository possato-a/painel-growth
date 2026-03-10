import { useState, useMemo, memo } from 'react';
import {
  Image,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Eye,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useAdsAll } from '@/hooks/useMetaAds';
import { DateRangeSelector } from '@/components/DateRangeSelector';
import { StatusFilter, matchesStatusFilter, type StatusFilterValue } from '@/components/StatusFilter';
import { RefreshControl } from '@/components/RefreshControl';
import { fmtCurrency, fmtCompact, fmtPct, fmtNumber } from '@/lib/formatters';
import { Badge, statusToBadgeVariant, statusLabel } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import type { DateRange, Ad } from '@/types/meta';

type SortMetric = 'ctr' | 'spend' | 'impressions' | 'cpc';

const SORT_LABELS: Record<SortMetric, string> = {
  ctr: 'CTR',
  spend: 'Investimento',
  impressions: 'Impressões',
  cpc: 'CPC',
};

function getAdInsight(ad: Ad) {
  return ad.insights?.data?.[0];
}

interface TopPerformerCardProps {
  label: string;
  icon: React.ReactNode;
  ad: Ad | undefined;
  metric: string;
  color: string;
}

function TopPerformerCard({ label, icon, ad, metric, color }: TopPerformerCardProps) {
  const ins = ad ? getAdInsight(ad) : undefined;

  return (
    <div
      className="bg-notion-bg-primary rounded shadow-notion-md p-4"
      style={{ borderTop: `3px solid ${color}` }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div style={{ color }}>{icon}</div>
        <span className="text-xs font-semibold uppercase tracking-wider text-notion-text-secondary">
          {label}
        </span>
      </div>
      {!ad ? (
        <p className="text-sm text-notion-text-tertiary">Sem dados</p>
      ) : (
        <>
          <div className="flex items-center gap-2 mb-2">
            {ad.creative?.thumbnail_url ? (
              <img
                src={ad.creative.thumbnail_url}
                alt={ad.name}
                className="w-10 h-10 rounded-md object-cover flex-shrink-0 bg-notion-bg-secondary"
              />
            ) : (
              <div className="w-10 h-10 rounded-md bg-notion-bg-secondary flex items-center justify-center flex-shrink-0">
                <Image size={16} className="text-notion-text-tertiary" />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-medium text-notion-text-primary truncate" title={ad.name}>
                {ad.name}
              </p>
              <p
                className="text-lg font-bold tabular-nums mt-0.5"
                style={{ color }}
              >
                {metric}
              </p>
            </div>
          </div>
          {ins && (
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-notion-border">
              <div>
                <p className="text-[10px] text-notion-text-tertiary uppercase tracking-wide">Spend</p>
                <p className="text-xs tabular-nums text-notion-text-primary">{fmtCurrency(ins.spend)}</p>
              </div>
              <div>
                <p className="text-[10px] text-notion-text-tertiary uppercase tracking-wide">Impr.</p>
                <p className="text-xs tabular-nums text-notion-text-primary">{fmtCompact(ins.impressions)}</p>
              </div>
              <div>
                <p className="text-[10px] text-notion-text-tertiary uppercase tracking-wide">CTR</p>
                <p className="text-xs tabular-nums text-notion-text-primary">{fmtPct(ins.ctr)}</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

interface AdRowProps {
  ad: Ad;
  rank: number;
}

const AdRow = memo(function AdRow({ ad, rank }: AdRowProps) {
  const ins = getAdInsight(ad);
  const spend = Number(ins?.spend ?? 0);
  const ctr = Number(ins?.ctr ?? 0);
  const isFatigued = spend > 100 && ctr < 0.5;

  return (
    <tr className="border-b border-notion-border hover:bg-notion-bg-secondary transition-colors duration-[60ms]">
      <td className="px-3 py-2.5 text-xs text-notion-text-tertiary tabular-nums text-center w-8">
        {rank}
      </td>
      <td className="px-3 py-2.5">
        <div className="flex items-center gap-2.5">
          {ad.creative?.thumbnail_url ? (
            <img
              src={ad.creative.thumbnail_url}
              alt={ad.name}
              className="w-10 h-10 rounded-md object-cover flex-shrink-0 bg-notion-bg-secondary"
            />
          ) : (
            <div className="w-10 h-10 rounded-md bg-notion-bg-secondary flex items-center justify-center flex-shrink-0">
              <Image size={14} className="text-notion-text-tertiary" />
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p
                className="text-sm text-notion-text-primary truncate max-w-[200px]"
                title={ad.name}
              >
                {ad.name}
              </p>
              {isFatigued && (
                <span title="Possível fadiga criativa">
                  <AlertTriangle size={12} className="text-[#D9730D] flex-shrink-0" />
                </span>
              )}
            </div>
            <p className="text-xs text-notion-text-tertiary truncate max-w-[200px]">
              ID: {ad.id}
            </p>
          </div>
        </div>
      </td>
      <td className="px-3 py-2.5">
        <Badge variant={statusToBadgeVariant(ad.effective_status)}>
          {statusLabel(ad.effective_status)}
        </Badge>
      </td>
      <td className="px-3 py-2.5 text-right text-sm tabular-nums text-notion-text-primary">
        {ins ? fmtCurrency(ins.spend) : '—'}
      </td>
      <td className="px-3 py-2.5 text-right text-sm tabular-nums text-notion-text-primary">
        {ins ? fmtCompact(ins.impressions) : '—'}
      </td>
      <td className="px-3 py-2.5 text-right text-sm tabular-nums text-notion-text-primary">
        {ins ? fmtNumber(ins.clicks) : '—'}
      </td>
      <td className="px-3 py-2.5 text-right text-sm tabular-nums text-notion-text-primary">
        {ins ? fmtPct(ins.ctr) : '—'}
      </td>
      <td className="px-3 py-2.5 text-right text-sm tabular-nums text-notion-text-primary">
        {ins ? fmtCurrency(ins.cpc) : '—'}
      </td>
    </tr>
  );
});

export function CriativosPage() {
  const [dateRange, setDateRange] = useState<DateRange>('last_30d');
  const [sortMetric, setSortMetric] = useState<SortMetric>('spend');
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>('all');
  const { data: adsData, isLoading, error } = useAdsAll(dateRange);
  const allAds = adsData?.data ?? [];
  const ads = useMemo(
    () => allAds.filter((a) => matchesStatusFilter(a.effective_status, statusFilter)),
    [allAds, statusFilter]
  );

  const sortedAds = useMemo(() => {
    return [...ads].sort((a, b) => {
      const aIns = getAdInsight(a);
      const bIns = getAdInsight(b);
      const aVal = Number(aIns?.[sortMetric] ?? 0);
      const bVal = Number(bIns?.[sortMetric] ?? 0);
      // For CPC, lower is better when sorting for "top performer"
      if (sortMetric === 'cpc') return aVal - bVal;
      return bVal - aVal;
    });
  }, [ads, sortMetric]);

  const topByCtr = useMemo(
    () => [...ads].sort((a, b) => Number(getAdInsight(b)?.ctr ?? 0) - Number(getAdInsight(a)?.ctr ?? 0))[0],
    [ads]
  );
  const topByImpressions = useMemo(
    () => [...ads].sort((a, b) => Number(getAdInsight(b)?.impressions ?? 0) - Number(getAdInsight(a)?.impressions ?? 0))[0],
    [ads]
  );
  const topByCpc = useMemo(
    () =>
      [...ads]
        .filter((a) => Number(getAdInsight(a)?.cpc ?? 0) > 0)
        .sort((a, b) => Number(getAdInsight(a)?.cpc ?? 0) - Number(getAdInsight(b)?.cpc ?? 0))[0],
    [ads]
  );

  const ctrBuckets = useMemo(() => {
    const buckets: Record<string, number> = {
      '0-0.5%': 0,
      '0.5-1%': 0,
      '1-2%': 0,
      '2-3%': 0,
      '3-5%': 0,
      '>5%': 0,
    };
    for (const ad of ads) {
      const ctr = Number(getAdInsight(ad)?.ctr ?? 0);
      if (ctr < 0.5) buckets['0-0.5%']++;
      else if (ctr < 1) buckets['0.5-1%']++;
      else if (ctr < 2) buckets['1-2%']++;
      else if (ctr < 3) buckets['2-3%']++;
      else if (ctr < 5) buckets['3-5%']++;
      else buckets['>5%']++;
    }
    return Object.entries(buckets).map(([range, count]) => ({ range, count }));
  }, [ads]);

  const fatiguedAds = useMemo(
    () =>
      ads.filter((ad) => {
        const ins = getAdInsight(ad);
        return Number(ins?.spend ?? 0) > 100 && Number(ins?.ctr ?? 0) < 0.5;
      }),
    [ads]
  );

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-10 bg-notion-bg-secondary border-b border-notion-border px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-notion-text-primary tracking-tight">
              Performance de Criativos
            </h1>
            <span className="text-xs font-medium text-notion-text-secondary bg-notion-bg-primary border border-notion-border px-2.5 py-1 rounded-sm">
              Meta Ads · Franquia Be Honest
            </span>
          </div>
          <div className="flex items-center gap-2">
            <RefreshControl />
            <StatusFilter value={statusFilter} onChange={setStatusFilter} />
            <DateRangeSelector value={dateRange} onChange={setDateRange} />
          </div>
        </div>
      </div>

      <div className="px-8 py-6 space-y-6">
        {/* Top performers */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="bg-notion-bg-primary rounded shadow-notion-md p-4 space-y-3">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-6 w-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <TopPerformerCard
              label="Melhor CTR"
              icon={<TrendingUp size={14} />}
              ad={topByCtr}
              metric={topByCtr ? fmtPct(getAdInsight(topByCtr)?.ctr ?? 0) : '—'}
              color="#2383E2"
            />
            <TopPerformerCard
              label="Menor CPC"
              icon={<DollarSign size={14} />}
              ad={topByCpc}
              metric={topByCpc ? fmtCurrency(getAdInsight(topByCpc)?.cpc ?? 0) : '—'}
              color="#0F7B6C"
            />
            <TopPerformerCard
              label="Mais Impressões"
              icon={<Eye size={14} />}
              ad={topByImpressions}
              metric={topByImpressions ? fmtCompact(getAdInsight(topByImpressions)?.impressions ?? 0) : '—'}
              color="#37352F"
            />
          </div>
        )}

        {/* Ads table */}
        {!isLoading && (
          <div className="bg-notion-bg-primary rounded shadow-notion-md overflow-hidden">
            <div className="px-5 py-4 border-b border-notion-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-base font-semibold text-notion-text-primary">Todos os Anúncios</h2>
                <span className="text-xs text-notion-text-tertiary bg-notion-bg-secondary px-2 py-0.5 rounded-sm border border-notion-border">
                  {ads.length}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-notion-text-tertiary mr-1">Ordenar por:</span>
                {(Object.keys(SORT_LABELS) as SortMetric[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setSortMetric(m)}
                    className={`text-xs px-2.5 py-1 rounded transition-colors duration-[120ms] ${
                      sortMetric === m
                        ? 'bg-notion-primary text-white'
                        : 'bg-notion-bg-secondary text-notion-text-secondary hover:bg-notion-bg-tertiary'
                    }`}
                  >
                    {SORT_LABELS[m]}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="px-5 py-4 text-sm text-[#E03E3E]">
                Erro ao carregar anúncios. Verifique o token de acesso.
              </div>
            )}

            {!error && (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse min-w-[800px]">
                  <thead>
                    <tr className="border-b border-notion-border bg-notion-bg-secondary/50">
                      <th className="px-3 py-2.5 text-center text-xs font-medium text-notion-text-secondary w-8">#</th>
                      <th className="px-3 py-2.5 text-left text-xs font-medium text-notion-text-secondary">Anúncio</th>
                      <th className="px-3 py-2.5 text-left text-xs font-medium text-notion-text-secondary">Status</th>
                      <th className="px-3 py-2.5 text-right text-xs font-medium text-notion-text-secondary">Investimento</th>
                      <th className="px-3 py-2.5 text-right text-xs font-medium text-notion-text-secondary">Impressões</th>
                      <th className="px-3 py-2.5 text-right text-xs font-medium text-notion-text-secondary">Cliques</th>
                      <th className="px-3 py-2.5 text-right text-xs font-medium text-notion-text-secondary">CTR</th>
                      <th className="px-3 py-2.5 text-right text-xs font-medium text-notion-text-secondary">CPC</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedAds.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-5 py-8 text-sm text-notion-text-tertiary text-center">
                          Nenhum anúncio encontrado para o período selecionado.
                        </td>
                      </tr>
                    ) : (
                      sortedAds.map((ad, i) => <AdRow key={ad.id} ad={ad} rank={i + 1} />)
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* CTR Distribution */}
        {!isLoading && ads.length > 0 && (
          <div className="bg-notion-bg-primary rounded shadow-notion-md p-5">
            <h3 className="text-sm font-semibold text-notion-text-primary mb-4">
              Distribuição de CTR
            </h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={ctrBuckets} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E9E9E7" />
                <XAxis
                  dataKey="range"
                  tick={{ fontSize: 11, fill: '#9B9A97' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#9B9A97' }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{ fontSize: 12, border: '1px solid #E9E9E7', borderRadius: 6 }}
                  formatter={(v: number) => [v, 'Anúncios']}
                />
                <Bar dataKey="count" fill="#2383E2" radius={[3, 3, 0, 0]} name="Anúncios" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Creative fatigue */}
        {!isLoading && fatiguedAds.length > 0 && (
          <div className="bg-notion-bg-primary rounded shadow-notion-md overflow-hidden">
            <div
              className="px-5 py-3 flex items-center gap-2 border-b border-notion-border"
              style={{ borderLeft: '3px solid #D9730D' }}
            >
              <AlertTriangle size={14} className="text-[#D9730D]" />
              <h3 className="text-sm font-semibold text-notion-text-primary">
                Fadiga Criativa Detectada
              </h3>
              <span className="text-xs text-[#D9730D] bg-[#FFF3E0] px-1.5 py-0.5 rounded-sm">
                {fatiguedAds.length} anúncio{fatiguedAds.length > 1 ? 's' : ''}
              </span>
            </div>
            <p className="text-xs text-notion-text-secondary px-5 py-2 border-b border-notion-border bg-notion-bg-secondary/50">
              Anúncios com investimento {'>'} R$100 e CTR {'<'} 0.5% — possível fadiga ou audiência saturada
            </p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-notion-border bg-notion-bg-secondary/50">
                    <th className="px-3 py-2.5 text-left text-xs font-medium text-notion-text-secondary">Anúncio</th>
                    <th className="px-3 py-2.5 text-right text-xs font-medium text-notion-text-secondary">Investimento</th>
                    <th className="px-3 py-2.5 text-right text-xs font-medium text-notion-text-secondary">CTR</th>
                    <th className="px-3 py-2.5 text-right text-xs font-medium text-notion-text-secondary">Impressões</th>
                    <th className="px-3 py-2.5 text-right text-xs font-medium text-notion-text-secondary">CPC</th>
                  </tr>
                </thead>
                <tbody>
                  {fatiguedAds.map((ad) => {
                    const ins = getAdInsight(ad);
                    return (
                      <tr key={ad.id} className="border-b border-notion-border hover:bg-notion-bg-secondary transition-colors duration-[60ms]">
                        <td className="px-3 py-2.5 max-w-[280px]">
                          <p className="text-sm text-notion-text-primary truncate" title={ad.name}>{ad.name}</p>
                        </td>
                        <td className="px-3 py-2.5 text-right text-sm tabular-nums text-[#D9730D] font-medium">{ins ? fmtCurrency(ins.spend) : '—'}</td>
                        <td className="px-3 py-2.5 text-right text-sm tabular-nums text-[#E03E3E] font-medium">{ins ? fmtPct(ins.ctr) : '—'}</td>
                        <td className="px-3 py-2.5 text-right text-sm tabular-nums">{ins ? fmtCompact(ins.impressions) : '—'}</td>
                        <td className="px-3 py-2.5 text-right text-sm tabular-nums">{ins ? fmtCurrency(ins.cpc) : '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        )}
      </div>
    </div>
  );
}
