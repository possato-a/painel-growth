import { useState } from 'react';
import { ChevronRight, ArrowUp, ArrowDown } from 'lucide-react';
import { useGadsAdGroups, useGadsAds } from '@/hooks/useGoogleAds';
import { Badge } from '@/components/ui/Badge';
import { SkeletonRow } from '@/components/ui/Skeleton';
import { fmtCurrency, fmtNumber, fmtPct, fmtCompact } from '@/lib/formatters';
import { cn } from '@/lib/cn';
import type { DateRange } from '@/types/meta';
import type { GadsAdGroup } from '@/types/gads';

// ── Status helpers ──────────────────────────────────────────────────────────
function gadsVariant(s: string): 'active' | 'paused' | 'archived' {
  if (s === 'ENABLED') return 'active';
  if (s === 'PAUSED')  return 'paused';
  return 'archived';
}
function gadsLabel(s: string) {
  if (s === 'ENABLED') return 'Ativo';
  if (s === 'PAUSED')  return 'Pausado';
  if (s === 'REMOVED') return 'Removido';
  return s;
}

// ── Types ───────────────────────────────────────────────────────────────────
type SortKey = 'name' | 'spend' | 'impressions' | 'clicks' | 'ctr' | 'cpm' | 'cpc' | 'conversions' | 'costPerConversion';
type SortDir = 'asc' | 'desc';

interface Props {
  campaignId: string;
  expandedId: string | null;
  onExpand: (id: string | null) => void;
  datePreset: DateRange;
}

function sort(items: GadsAdGroup[], key: SortKey, dir: SortDir): GadsAdGroup[] {
  return [...items].sort((a, b) => {
    const av = key === 'name' ? a.name.toLowerCase() : Number(a.metrics[key] ?? 0);
    const bv = key === 'name' ? b.name.toLowerCase() : Number(b.metrics[key] ?? 0);
    if (av < bv) return dir === 'asc' ? -1 : 1;
    if (av > bv) return dir === 'asc' ? 1 : -1;
    return 0;
  });
}

function SortableHeader({
  label, sortKey, currentKey, direction, onSort, align = 'left',
}: {
  label: string; sortKey: SortKey; currentKey: SortKey;
  direction: SortDir; onSort: (k: SortKey) => void; align?: 'left' | 'right';
}) {
  const active = currentKey === sortKey;
  return (
    <th
      className={cn('px-3 py-2 text-xs font-medium text-notion-text-secondary cursor-pointer select-none whitespace-nowrap', align === 'right' ? 'text-right' : 'text-left')}
      onClick={() => onSort(sortKey)}
    >
      <span className={cn('inline-flex items-center gap-1', align === 'right' ? 'flex-row-reverse' : '')}>
        {label}
        <span className={cn('transition-opacity', active ? 'opacity-100' : 'opacity-0')}>
          {active && direction === 'asc' ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
        </span>
      </span>
    </th>
  );
}

// ── Ads leaf table ──────────────────────────────────────────────────────────
function AdsLeaf({ adGroupId, datePreset }: { adGroupId: string; datePreset: DateRange }) {
  const { data, isLoading, error } = useGadsAds(adGroupId, datePreset);
  const ads = data?.data ?? [];

  const AD_TYPE: Record<string, string> = {
    RESPONSIVE_SEARCH_AD:  'Pesquisa Responsivo',
    EXPANDED_TEXT_AD:      'Texto Expandido',
    CALL_ONLY_AD:          'Apenas Chamada',
    RESPONSIVE_DISPLAY_AD: 'Display Responsivo',
    IMAGE_AD:              'Imagem',
    VIDEO_RESPONSIVE_AD:   'Vídeo Responsivo',
    SHOPPING_PRODUCT_AD:   'Shopping',
    SMART_CAMPAIGN_AD:     'Smart',
    APP_AD:                'App',
  };

  return (
    <tr>
      <td colSpan={11} className="p-0">
        <div className="ml-12 border-l-2 border-[#0F7B6C]/30 bg-notion-bg-primary">
          <div className="px-4 py-2.5 border-b border-notion-border flex items-center gap-2">
            <span className="text-xs font-semibold text-notion-text-primary uppercase tracking-wider">Anúncios</span>
            {!isLoading && <span className="text-xs text-notion-text-tertiary bg-notion-bg-tertiary px-1.5 py-0.5 rounded-sm">{ads.length}</span>}
          </div>
          {error && <div className="px-4 py-3 text-xs text-[#E03E3E]">Erro ao carregar anúncios.</div>}
          {!error && (
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-notion-border">
                  <th className="px-3 py-2 text-left text-xs font-medium text-notion-text-secondary w-[260px]">Nome</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-notion-text-secondary">Tipo</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-notion-text-secondary">Status</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-notion-text-secondary">Investimento</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-notion-text-secondary">Impressões</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-notion-text-secondary">Cliques</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-notion-text-secondary">CTR</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-notion-text-secondary">CPC</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-notion-text-secondary">Conv.</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && Array.from({ length: 2 }).map((_, i) => <SkeletonRow key={i} cols={9} />)}
                {!isLoading && ads.length === 0 && (
                  <tr><td colSpan={9} className="px-4 py-3 text-xs text-notion-text-tertiary text-center">Nenhum anúncio encontrado.</td></tr>
                )}
                {!isLoading && ads.map((ad) => (
                  <tr key={ad.id} className="border-b border-notion-border last:border-0 hover:bg-notion-bg-secondary/50 transition-colors">
                    <td className="px-3 py-2 max-w-[260px]"><p className="text-xs text-notion-text-primary truncate" title={ad.name}>{ad.name || '(sem nome)'}</p></td>
                    <td className="px-3 py-2 text-xs text-notion-text-secondary">{AD_TYPE[ad.type] ?? ad.type}</td>
                    <td className="px-3 py-2"><Badge variant={gadsVariant(ad.status)}>{gadsLabel(ad.status)}</Badge></td>
                    <td className="px-3 py-2 text-right text-xs text-notion-text-primary tabular-nums">{fmtCurrency(ad.metrics.spend)}</td>
                    <td className="px-3 py-2 text-right text-xs text-notion-text-primary tabular-nums">{fmtCompact(ad.metrics.impressions)}</td>
                    <td className="px-3 py-2 text-right text-xs text-notion-text-primary tabular-nums">{fmtNumber(ad.metrics.clicks)}</td>
                    <td className="px-3 py-2 text-right text-xs text-notion-text-primary tabular-nums">{fmtPct(ad.metrics.ctr)}</td>
                    <td className="px-3 py-2 text-right text-xs text-notion-text-primary tabular-nums">{fmtCurrency(ad.metrics.cpc)}</td>
                    <td className="px-3 py-2 text-right text-xs text-[#0F7B6C] font-medium tabular-nums">{fmtNumber(ad.metrics.conversions)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </td>
    </tr>
  );
}

// ── Main component ──────────────────────────────────────────────────────────
export function GadsAdGroupsTable({ campaignId, expandedId, onExpand, datePreset }: Props) {
  const { data, isLoading, error } = useGadsAdGroups(campaignId, datePreset);
  const [sortKey, setSortKey] = useState<SortKey>('spend');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const adGroups = sort(data?.data ?? [], sortKey, sortDir);

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('desc'); }
  }

  const sp = { currentKey: sortKey, direction: sortDir, onSort: handleSort };

  return (
    <tr>
      <td colSpan={12} className="p-0">
        <div className="ml-8 border-l-2 border-notion-primary/30 bg-[#F9F9F8]">
          <div className="px-4 py-3 border-b border-notion-border flex items-center gap-2">
            <span className="text-xs font-semibold text-notion-text-primary uppercase tracking-wider">Grupos de Anúncios</span>
            {!isLoading && <span className="text-xs text-notion-text-tertiary bg-notion-bg-tertiary px-1.5 py-0.5 rounded-sm">{adGroups.length}</span>}
          </div>

          {error && <div className="px-4 py-3 text-xs text-[#E03E3E]">Erro ao carregar grupos de anúncios.</div>}

          {!error && (
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-notion-border">
                  <th className="px-3 py-2 w-8" />
                  <SortableHeader label="Nome"          sortKey="name"              align="left"  {...sp} />
                  <th className="px-3 py-2 text-left text-xs font-medium text-notion-text-secondary">Status</th>
                  <SortableHeader label="Investimento"  sortKey="spend"             align="right" {...sp} />
                  <SortableHeader label="Impressões"    sortKey="impressions"       align="right" {...sp} />
                  <SortableHeader label="Cliques"       sortKey="clicks"            align="right" {...sp} />
                  <SortableHeader label="CTR"           sortKey="ctr"               align="right" {...sp} />
                  <SortableHeader label="CPM"           sortKey="cpm"               align="right" {...sp} />
                  <SortableHeader label="CPC"           sortKey="cpc"               align="right" {...sp} />
                  <SortableHeader label="Conv."         sortKey="conversions"       align="right" {...sp} />
                  <SortableHeader label="Custo/Conv."   sortKey="costPerConversion" align="right" {...sp} />
                </tr>
              </thead>
              <tbody>
                {isLoading && Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} cols={11} />)}
                {!isLoading && adGroups.length === 0 && (
                  <tr><td colSpan={11} className="px-4 py-4 text-xs text-notion-text-tertiary text-center">Nenhum grupo encontrado.</td></tr>
                )}
                {!isLoading && adGroups.map((ag) => {
                  const isExpanded = expandedId === ag.id;
                  const m = ag.metrics;
                  return (
                    <>
                      <tr
                        key={ag.id}
                        className={cn('border-b border-notion-border hover:bg-notion-bg-tertiary transition-colors duration-[60ms] cursor-pointer', isExpanded && 'bg-notion-bg-tertiary')}
                        onClick={() => onExpand(isExpanded ? null : ag.id)}
                      >
                        <td className="px-3 py-2 w-8">
                          <ChevronRight size={14} className={cn('text-notion-text-tertiary transition-transform duration-[120ms]', isExpanded && 'rotate-90')} />
                        </td>
                        <td className="px-3 py-2 max-w-[200px]"><p className="text-sm text-notion-text-primary truncate" title={ag.name}>{ag.name}</p></td>
                        <td className="px-3 py-2"><Badge variant={gadsVariant(ag.status)}>{gadsLabel(ag.status)}</Badge></td>
                        <td className="px-3 py-2 text-right text-sm tabular-nums text-notion-text-primary">{fmtCurrency(m.spend)}</td>
                        <td className="px-3 py-2 text-right text-sm tabular-nums text-notion-text-primary">{fmtCompact(m.impressions)}</td>
                        <td className="px-3 py-2 text-right text-sm tabular-nums text-notion-text-primary">{fmtNumber(m.clicks)}</td>
                        <td className="px-3 py-2 text-right text-sm tabular-nums text-notion-text-primary">{fmtPct(m.ctr)}</td>
                        <td className="px-3 py-2 text-right text-sm tabular-nums text-notion-text-primary">{fmtCurrency(m.cpm)}</td>
                        <td className="px-3 py-2 text-right text-sm tabular-nums text-notion-text-primary">{fmtCurrency(m.cpc)}</td>
                        <td className="px-3 py-2 text-right text-sm tabular-nums font-medium text-[#0F7B6C]">{fmtNumber(m.conversions)}</td>
                        <td className="px-3 py-2 text-right text-sm tabular-nums text-notion-text-primary">{fmtCurrency(m.costPerConversion)}</td>
                      </tr>
                      {isExpanded && (
                        <AdsLeaf key={`ads-${ag.id}`} adGroupId={ag.id} datePreset={datePreset} />
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </td>
    </tr>
  );
}
