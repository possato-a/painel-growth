import { useState } from 'react';
import { ChevronRight, ArrowUp, ArrowDown } from 'lucide-react';
import { useAdSets } from '@/hooks/useMetaAds';
import { Badge, statusToBadgeVariant, statusLabel } from '@/components/ui/Badge';
import { SkeletonRow } from '@/components/ui/Skeleton';
import { fmtCurrency, fmtNumber, fmtPct, fmtCompact } from '@/lib/formatters';
import { AdsTable } from './AdsTable';
import { cn } from '@/lib/cn';
import type { DatePreset, AdSet } from '@/types/meta';

interface AdSetsTableProps {
  campaignId: string;
  expandedId: string | null;
  onExpand: (id: string | null) => void;
  datePreset: DatePreset;
}

type SortKey = 'name' | 'spend' | 'impressions' | 'reach' | 'clicks' | 'ctr' | 'cpm' | 'cpc';
type SortDir = 'asc' | 'desc';

function getInsight(adset: AdSet) {
  return adset.insights?.data?.[0];
}

function sortAdSets(adsets: AdSet[], key: SortKey, dir: SortDir): AdSet[] {
  return [...adsets].sort((a, b) => {
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

function SortableHeader({ label, sortKey, currentKey, direction, onSort, align = 'left' }: SortableHeaderProps) {
  const active = currentKey === sortKey;
  return (
    <th
      className={cn(
        'px-3 py-2 text-xs font-medium text-notion-text-secondary cursor-pointer select-none whitespace-nowrap',
        align === 'right' ? 'text-right' : 'text-left'
      )}
      onClick={() => onSort(sortKey)}
    >
      <span className={cn('inline-flex items-center gap-1', align === 'right' ? 'flex-row-reverse' : '')}>
        {label}
        <span className={cn('transition-opacity', active ? 'opacity-100' : 'opacity-0 group-hover:opacity-50')}>
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

export function AdSetsTable({ campaignId, expandedId, onExpand, datePreset }: AdSetsTableProps) {
  const { data, isLoading, error } = useAdSets(campaignId, datePreset);
  const [sortKey, setSortKey] = useState<SortKey>('spend');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const rawAdsets = data?.data ?? [];
  const adsets = sortAdSets(rawAdsets, sortKey, sortDir);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  }

  const sortProps = { currentKey: sortKey, direction: sortDir, onSort: handleSort };

  return (
    <tr>
      <td colSpan={11} className="p-0">
        <div className="ml-8 border-l-2 border-notion-primary/30 bg-[#F9F9F8]">
          <div className="px-4 py-3 border-b border-notion-border">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-notion-text-primary uppercase tracking-wider">
                Conjuntos de Anúncios
              </span>
              {!isLoading && (
                <span className="text-xs text-notion-text-tertiary bg-notion-bg-tertiary px-1.5 py-0.5 rounded-sm">
                  {adsets.length}
                </span>
              )}
            </div>
          </div>

          {error && (
            <div className="px-4 py-3 text-xs text-[#E03E3E]">
              Erro ao carregar conjuntos de anúncios.
            </div>
          )}

          {!error && (
            <table className="w-full border-collapse group">
              <thead>
                <tr className="border-b border-notion-border">
                  <th className="px-3 py-2 w-8" />
                  <SortableHeader label="Nome" sortKey="name" align="left" {...sortProps} />
                  <th className="px-3 py-2 text-left text-xs font-medium text-notion-text-secondary">
                    Status
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
                  Array.from({ length: 3 }).map((_, i) => (
                    <SkeletonRow key={i} cols={10} />
                  ))}
                {!isLoading && adsets.length === 0 && (
                  <tr>
                    <td
                      colSpan={10}
                      className="px-4 py-4 text-xs text-notion-text-tertiary text-center"
                    >
                      Nenhum conjunto de anúncios encontrado.
                    </td>
                  </tr>
                )}
                {!isLoading &&
                  adsets.map((adset) => {
                    const ins = getInsight(adset);
                    const isExpanded = expandedId === adset.id;
                    return (
                      <>
                        <tr
                          key={adset.id}
                          className="border-b border-notion-border hover:bg-notion-bg-tertiary transition-colors duration-[60ms] cursor-pointer"
                          onClick={() => onExpand(isExpanded ? null : adset.id)}
                        >
                          <td className="px-3 py-2 w-8">
                            <ChevronRight
                              size={14}
                              className={cn(
                                'text-notion-text-tertiary transition-transform duration-[120ms]',
                                isExpanded && 'rotate-90'
                              )}
                            />
                          </td>
                          <td className="px-3 py-2 max-w-[200px]">
                            <p
                              className="text-sm text-notion-text-primary truncate"
                              title={adset.name}
                            >
                              {adset.name}
                            </p>
                          </td>
                          <td className="px-3 py-2">
                            <Badge variant={statusToBadgeVariant(adset.effective_status)}>
                              {statusLabel(adset.effective_status)}
                            </Badge>
                          </td>
                          <td className="px-3 py-2 text-right text-sm text-notion-text-primary tabular-nums">
                            {ins ? fmtCurrency(ins.spend) : '—'}
                          </td>
                          <td className="px-3 py-2 text-right text-sm text-notion-text-primary tabular-nums">
                            {ins ? fmtCompact(ins.impressions) : '—'}
                          </td>
                          <td className="px-3 py-2 text-right text-sm text-notion-text-primary tabular-nums">
                            {ins ? fmtCompact(ins.reach) : '—'}
                          </td>
                          <td className="px-3 py-2 text-right text-sm text-notion-text-primary tabular-nums">
                            {ins ? fmtNumber(ins.clicks) : '—'}
                          </td>
                          <td className="px-3 py-2 text-right text-sm text-notion-text-primary tabular-nums">
                            {ins ? fmtPct(ins.ctr) : '—'}
                          </td>
                          <td className="px-3 py-2 text-right text-sm text-notion-text-primary tabular-nums">
                            {ins ? fmtCurrency(ins.cpm) : '—'}
                          </td>
                          <td className="px-3 py-2 text-right text-sm text-notion-text-primary tabular-nums">
                            {ins ? fmtCurrency(ins.cpc) : '—'}
                          </td>
                        </tr>
                        {isExpanded && (
                          <AdsTable adsetId={adset.id} datePreset={datePreset} />
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
