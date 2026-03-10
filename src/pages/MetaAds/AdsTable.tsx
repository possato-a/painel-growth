import { Image } from 'lucide-react';
import { useAds } from '@/hooks/useMetaAds';
import { Badge, statusToBadgeVariant, statusLabel } from '@/components/ui/Badge';
import { SkeletonRow } from '@/components/ui/Skeleton';
import { fmtCurrency, fmtNumber, fmtPct, fmtCompact } from '@/lib/formatters';
import type { DatePreset, Ad } from '@/types/meta';

interface AdsTableProps {
  adsetId: string;
  datePreset: DatePreset;
}

function getInsight(ad: Ad) {
  return ad.insights?.data?.[0];
}

export function AdsTable({ adsetId, datePreset }: AdsTableProps) {
  const { data, isLoading, error } = useAds(adsetId, datePreset);
  const ads = data?.data ?? [];

  return (
    <tr>
      <td colSpan={11} className="p-0">
        <div className="ml-16 border-l-2 border-notion-primary/20 bg-[#FAFAFA]">
          <div className="px-4 py-3 border-b border-notion-border">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-notion-text-primary uppercase tracking-wider">
                Anúncios
              </span>
              {!isLoading && (
                <span className="text-xs text-notion-text-tertiary bg-notion-bg-tertiary px-1.5 py-0.5 rounded-sm">
                  {ads.length}
                </span>
              )}
            </div>
          </div>

          {error && (
            <div className="px-4 py-3 text-xs text-[#E03E3E]">
              Erro ao carregar anúncios.
            </div>
          )}

          {!error && (
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-notion-border">
                  <th className="px-3 py-2 text-left text-xs font-medium text-notion-text-secondary w-10" />
                  <th className="px-3 py-2 text-left text-xs font-medium text-notion-text-secondary">
                    Nome do Anúncio
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-notion-text-secondary">
                    Status
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-notion-text-secondary">
                    Investimento
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-notion-text-secondary">
                    Impressões
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-notion-text-secondary">
                    Alcance
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-notion-text-secondary">
                    Cliques
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-notion-text-secondary">
                    CTR
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-notion-text-secondary">
                    CPM
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-notion-text-secondary">
                    CPC
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading &&
                  Array.from({ length: 2 }).map((_, i) => (
                    <SkeletonRow key={i} cols={10} />
                  ))}
                {!isLoading && ads.length === 0 && (
                  <tr>
                    <td
                      colSpan={10}
                      className="px-4 py-4 text-xs text-notion-text-tertiary text-center"
                    >
                      Nenhum anúncio encontrado.
                    </td>
                  </tr>
                )}
                {!isLoading &&
                  ads.map((ad) => {
                    const ins = getInsight(ad);
                    return (
                      <tr
                        key={ad.id}
                        className="border-b border-notion-border last:border-0 hover:bg-notion-bg-tertiary transition-colors duration-[60ms]"
                      >
                        {/* Thumbnail */}
                        <td className="px-3 py-2 w-10">
                          {ad.creative?.thumbnail_url ? (
                            <img
                              src={ad.creative.thumbnail_url}
                              alt={ad.creative.name ?? 'thumbnail'}
                              className="w-9 h-9 rounded object-cover border border-notion-border flex-shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded bg-notion-bg-tertiary border border-notion-border flex items-center justify-center flex-shrink-0">
                              <Image size={14} className="text-notion-text-tertiary" />
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-2 max-w-[200px]">
                          <p className="text-sm text-notion-text-primary truncate" title={ad.name}>
                            {ad.name}
                          </p>
                        </td>
                        <td className="px-3 py-2">
                          <Badge variant={statusToBadgeVariant(ad.effective_status)}>
                            {statusLabel(ad.effective_status)}
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
