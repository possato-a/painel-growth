import { useState } from 'react';
import { ChevronRight, ArrowUp, ArrowDown } from 'lucide-react';
import { Badge, statusToBadgeVariant, statusLabel } from '@/components/ui/Badge';
import { SkeletonRow } from '@/components/ui/Skeleton';
import { fmtCurrency, fmtNumber, fmtPct, fmtCompact, getObjectiveLabel } from '@/lib/formatters';
import { AdSetsTable } from './AdSetsTable';
import { cn } from '@/lib/cn';
import type { DatePreset, Campaign } from '@/types/meta';

interface CampaignsTableProps {
  campaigns: Campaign[];
  isLoading: boolean;
  error: Error | null;
  expandedId: string | null;
  onExpand: (id: string | null) => void;
  datePreset: DatePreset;
}

type SortKey = 'name' | 'spend' | 'impressions' | 'reach' | 'clicks' | 'ctr' | 'cpm' | 'cpc';
type SortDir = 'asc' | 'desc';

function getInsight(campaign: Campaign) {
  return campaign.insights?.data?.[0];
}

function sortCampaigns(campaigns: Campaign[], key: SortKey, dir: SortDir): Campaign[] {
  return [...campaigns].sort((a, b) => {
    let aVal: string | number = '';
    let bVal: string | number = '';

    if (key === 'name') {
      aVal = a.name.toLowerCase();
      bVal = b.name.toLowerCase();
    } else {
      const aIns = getInsight(a);
      const bIns = getInsight(b);
      aVal = Number(aIns?.[key] ?? 0);
      bVal = Number(bIns?.[key] ?? 0);
    }

    if (aVal < bVal) return dir === 'asc' ? -1 : 1;
    if (aVal > bVal) return dir === 'asc' ? 1 : -1;
    return 0;
  });
}

interface SortableHeaderProps {
  label: string;
  sortKey: SortKey;
  currentKey: SortKey;
  direction: SortDir;
  onSort: (key: SortKey) => void;
  align?: 'left' | 'right';
}

function SortableHeader({
  label,
  sortKey,
  currentKey,
  direction,
  onSort,
  align = 'left',
}: SortableHeaderProps) {
  const active = currentKey === sortKey;
  return (
    <th
      className={cn(
        'px-3 py-3 text-xs font-medium text-notion-text-secondary cursor-pointer select-none whitespace-nowrap hover:text-notion-text-primary transition-colors duration-[120ms]',
        align === 'right' ? 'text-right' : 'text-left'
      )}
      onClick={() => onSort(sortKey)}
    >
      <span
        className={cn(
          'inline-flex items-center gap-1',
          align === 'right' ? 'flex-row-reverse' : ''
        )}
      >
        {label}
        <span
          className={cn(
            'transition-opacity',
            active ? 'opacity-100 text-notion-primary' : 'opacity-0'
          )}
        >
          {active && direction === 'asc' ? (
            <ArrowUp size={10} />
          ) : (
            <ArrowDown size={10} />
          )}
        </span>
      </span>
    </th>
  );
}

export function CampaignsTable({
  campaigns,
  isLoading,
  error,
  expandedId,
  onExpand,
  datePreset,
}: CampaignsTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('spend');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [expandedAdSetId, setExpandedAdSetId] = useState<string | null>(null);

  const sorted = sortCampaigns(campaigns, sortKey, sortDir);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  }

  function handleExpandCampaign(id: string | null) {
    onExpand(id);
    setExpandedAdSetId(null); // reset nested expansion
  }

  const sortProps = { currentKey: sortKey, direction: sortDir, onSort: handleSort };

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
          Erro ao carregar campanhas. Verifique o token de acesso.
        </div>
      )}

      {!error && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-notion-border bg-notion-bg-secondary/50">
                <th className="px-3 py-3 w-8" />
                <SortableHeader label="Nome" sortKey="name" align="left" {...sortProps} />
                <th className="px-3 py-3 text-left text-xs font-medium text-notion-text-secondary whitespace-nowrap">
                  Status
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-notion-text-secondary whitespace-nowrap">
                  Objetivo
                </th>
                <SortableHeader label="Investimento" sortKey="spend" align="right" {...sortProps} />
                <SortableHeader label="Impressões" sortKey="impressions" align="right" {...sortProps} />
                <SortableHeader label="Alcance" sortKey="reach" align="right" {...sortProps} />
                <SortableHeader label="Cliques" sortKey="clicks" align="right" {...sortProps} />
                <SortableHeader label="CTR" sortKey="ctr" align="right" {...sortProps} />
                <SortableHeader label="CPM" sortKey="cpm" align="right" {...sortProps} />
                <SortableHeader label="CPC" sortKey="cpc" align="right" {...sortProps} />
              </tr>
            </thead>
            <tbody>
              {isLoading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonRow key={i} cols={11} />
                ))}
              {!isLoading && sorted.length === 0 && (
                <tr>
                  <td
                    colSpan={11}
                    className="px-5 py-8 text-sm text-notion-text-tertiary text-center"
                  >
                    Nenhuma campanha encontrada para o período selecionado.
                  </td>
                </tr>
              )}
              {!isLoading &&
                sorted.map((campaign) => {
                  const ins = getInsight(campaign);
                  const isExpanded = expandedId === campaign.id;
                  return (
                    <>
                      <tr
                        key={campaign.id}
                        className={cn(
                          'border-b border-notion-border hover:bg-notion-bg-secondary transition-colors duration-[60ms] cursor-pointer',
                          isExpanded && 'bg-notion-bg-secondary'
                        )}
                        onClick={() => handleExpandCampaign(isExpanded ? null : campaign.id)}
                      >
                        <td className="px-3 py-2.5 w-8">
                          <ChevronRight
                            size={14}
                            className={cn(
                              'text-notion-text-tertiary transition-transform duration-[120ms]',
                              isExpanded && 'rotate-90 text-notion-primary'
                            )}
                          />
                        </td>
                        <td className="px-3 py-2.5 max-w-[240px]">
                          <p
                            className="text-sm text-notion-text-primary font-medium truncate"
                            title={campaign.name}
                          >
                            {campaign.name}
                          </p>
                        </td>
                        <td className="px-3 py-2.5">
                          <Badge variant={statusToBadgeVariant(campaign.effective_status)}>
                            {statusLabel(campaign.effective_status)}
                          </Badge>
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="text-sm text-notion-text-secondary">
                            {getObjectiveLabel(campaign.objective)}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-right text-sm text-notion-text-primary tabular-nums">
                          {ins ? fmtCurrency(ins.spend) : '—'}
                        </td>
                        <td className="px-3 py-2.5 text-right text-sm text-notion-text-primary tabular-nums">
                          {ins ? fmtCompact(ins.impressions) : '—'}
                        </td>
                        <td className="px-3 py-2.5 text-right text-sm text-notion-text-primary tabular-nums">
                          {ins ? fmtCompact(ins.reach) : '—'}
                        </td>
                        <td className="px-3 py-2.5 text-right text-sm text-notion-text-primary tabular-nums">
                          {ins ? fmtNumber(ins.clicks) : '—'}
                        </td>
                        <td className="px-3 py-2.5 text-right text-sm text-notion-text-primary tabular-nums">
                          {ins ? fmtPct(ins.ctr) : '—'}
                        </td>
                        <td className="px-3 py-2.5 text-right text-sm text-notion-text-primary tabular-nums">
                          {ins ? fmtCurrency(ins.cpm) : '—'}
                        </td>
                        <td className="px-3 py-2.5 text-right text-sm text-notion-text-primary tabular-nums">
                          {ins ? fmtCurrency(ins.cpc) : '—'}
                        </td>
                      </tr>
                      {isExpanded && (
                        <AdSetsTable
                          key={`adsets-${campaign.id}`}
                          campaignId={campaign.id}
                          expandedId={expandedAdSetId}
                          onExpand={setExpandedAdSetId}
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
