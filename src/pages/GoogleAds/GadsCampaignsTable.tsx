import { useState } from 'react';
import { ChevronRight, ArrowUp, ArrowDown } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { SkeletonRow } from '@/components/ui/Skeleton';
import { fmtCurrency, fmtNumber, fmtPct, fmtCompact } from '@/lib/formatters';
import { GadsAdGroupsTable } from './GadsAdGroupsTable';
import { cn } from '@/lib/cn';
import type { DateRange } from '@/types/meta';
import type { GadsCampaign } from '@/types/gads';

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

const CHANNEL_LABELS: Record<string, string> = {
  SEARCH:          'Search',
  DISPLAY:         'Display',
  SHOPPING:        'Shopping',
  VIDEO:           'Vídeo',
  MULTI_CHANNEL:   'Multi-canal',
  LOCAL:           'Local',
  SMART:           'Smart',
  PERFORMANCE_MAX: 'Performance Max',
  DISCOVERY:       'Discovery',
};

// ── Sort ────────────────────────────────────────────────────────────────────
type SortKey = 'name' | 'spend' | 'impressions' | 'clicks' | 'ctr' | 'cpm' | 'cpc' | 'conversions' | 'costPerConversion' | 'conversionRate';
type SortDir = 'asc' | 'desc';

function sortCampaigns(campaigns: GadsCampaign[], key: SortKey, dir: SortDir): GadsCampaign[] {
  return [...campaigns].sort((a, b) => {
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
      className={cn('px-3 py-3 text-xs font-medium text-notion-text-secondary cursor-pointer select-none whitespace-nowrap hover:text-notion-text-primary transition-colors duration-[120ms]', align === 'right' ? 'text-right' : 'text-left')}
      onClick={() => onSort(sortKey)}
    >
      <span className={cn('inline-flex items-center gap-1', align === 'right' ? 'flex-row-reverse' : '')}>
        {label}
        <span className={cn('transition-opacity', active ? 'opacity-100 text-notion-primary' : 'opacity-0')}>
          {active && direction === 'asc' ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
        </span>
      </span>
    </th>
  );
}

// ── Component ───────────────────────────────────────────────────────────────
interface Props {
  campaigns: GadsCampaign[];
  isLoading: boolean;
  error: Error | null;
  expandedId: string | null;
  onExpand: (id: string | null) => void;
  datePreset: DateRange;
}

export function GadsCampaignsTable({ campaigns, isLoading, error, expandedId, onExpand, datePreset }: Props) {
  const [sortKey, setSortKey]               = useState<SortKey>('spend');
  const [sortDir, setSortDir]               = useState<SortDir>('desc');
  const [expandedAdGroupId, setExpandedAdGroupId] = useState<string | null>(null);

  const sorted = sortCampaigns(campaigns, sortKey, sortDir);

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('desc'); }
  }

  function handleExpandCampaign(id: string | null) {
    onExpand(id);
    setExpandedAdGroupId(null);
  }

  const sp = { currentKey: sortKey, direction: sortDir, onSort: handleSort };

  return (
    <div className="bg-notion-bg-primary rounded shadow-notion-md overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-notion-border flex items-center gap-3">
        <h2 className="text-base font-semibold text-notion-text-primary">Campanhas</h2>
        {!isLoading && (
          <span className="text-xs text-notion-text-tertiary bg-notion-bg-secondary px-2 py-0.5 rounded-sm border border-notion-border">
            {campaigns.length}
          </span>
        )}
      </div>

      {error && (
        <div className="px-5 py-4 text-sm text-[#E03E3E]">
          Erro ao carregar campanhas. Verifique as credenciais do Google Ads.
        </div>
      )}

      {!error && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[1100px]">
            <thead>
              <tr className="border-b border-notion-border bg-notion-bg-secondary/50">
                <th className="px-3 py-3 w-8" />
                <SortableHeader label="Nome"          sortKey="name"              align="left"  {...sp} />
                <th className="px-3 py-3 text-left text-xs font-medium text-notion-text-secondary whitespace-nowrap">Status</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-notion-text-secondary whitespace-nowrap">Tipo</th>
                <SortableHeader label="Investimento"  sortKey="spend"             align="right" {...sp} />
                <SortableHeader label="Impressões"    sortKey="impressions"       align="right" {...sp} />
                <SortableHeader label="Cliques"       sortKey="clicks"            align="right" {...sp} />
                <SortableHeader label="CTR"           sortKey="ctr"               align="right" {...sp} />
                <SortableHeader label="CPM"           sortKey="cpm"               align="right" {...sp} />
                <SortableHeader label="CPC"           sortKey="cpc"               align="right" {...sp} />
                <SortableHeader label="Conv."         sortKey="conversions"       align="right" {...sp} />
                <SortableHeader label="Taxa Conv."    sortKey="conversionRate"    align="right" {...sp} />
                <SortableHeader label="Custo/Conv."   sortKey="costPerConversion" align="right" {...sp} />
              </tr>
            </thead>
            <tbody>
              {isLoading && Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={13} />)}

              {!isLoading && sorted.length === 0 && (
                <tr>
                  <td colSpan={13} className="px-5 py-8 text-sm text-notion-text-tertiary text-center">
                    Nenhuma campanha encontrada para o período selecionado.
                  </td>
                </tr>
              )}

              {!isLoading && sorted.map((campaign) => {
                const m = campaign.metrics;
                const isExpanded = expandedId === campaign.id;
                return (
                  <>
                    <tr
                      key={campaign.id}
                      className={cn('border-b border-notion-border hover:bg-notion-bg-secondary transition-colors duration-[60ms] cursor-pointer', isExpanded && 'bg-notion-bg-secondary')}
                      onClick={() => handleExpandCampaign(isExpanded ? null : campaign.id)}
                    >
                      <td className="px-3 py-2.5 w-8">
                        <ChevronRight size={14} className={cn('text-notion-text-tertiary transition-transform duration-[120ms]', isExpanded && 'rotate-90 text-notion-primary')} />
                      </td>
                      <td className="px-3 py-2.5 max-w-[240px]">
                        <p className="text-sm text-notion-text-primary font-medium truncate" title={campaign.name}>{campaign.name}</p>
                      </td>
                      <td className="px-3 py-2.5"><Badge variant={gadsVariant(campaign.status)}>{gadsLabel(campaign.status)}</Badge></td>
                      <td className="px-3 py-2.5 text-sm text-notion-text-secondary">{CHANNEL_LABELS[campaign.channelType] ?? campaign.channelType}</td>
                      <td className="px-3 py-2.5 text-right text-sm text-notion-text-primary tabular-nums">{fmtCurrency(m.spend)}</td>
                      <td className="px-3 py-2.5 text-right text-sm text-notion-text-primary tabular-nums">{fmtCompact(m.impressions)}</td>
                      <td className="px-3 py-2.5 text-right text-sm text-notion-text-primary tabular-nums">{fmtNumber(m.clicks)}</td>
                      <td className="px-3 py-2.5 text-right text-sm text-notion-text-primary tabular-nums">{fmtPct(m.ctr)}</td>
                      <td className="px-3 py-2.5 text-right text-sm text-notion-text-primary tabular-nums">{fmtCurrency(m.cpm)}</td>
                      <td className="px-3 py-2.5 text-right text-sm text-notion-text-primary tabular-nums">{fmtCurrency(m.cpc)}</td>
                      <td className="px-3 py-2.5 text-right text-sm font-semibold text-[#0F7B6C] tabular-nums">{fmtNumber(m.conversions)}</td>
                      <td className="px-3 py-2.5 text-right text-sm text-notion-text-primary tabular-nums">{fmtPct(m.conversionRate)}</td>
                      <td className="px-3 py-2.5 text-right text-sm text-notion-text-primary tabular-nums">{fmtCurrency(m.costPerConversion)}</td>
                    </tr>
                    {isExpanded && (
                      <GadsAdGroupsTable
                        key={`ag-${campaign.id}`}
                        campaignId={campaign.id}
                        expandedId={expandedAdGroupId}
                        onExpand={setExpandedAdGroupId}
                        datePreset={datePreset}
                      />
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
