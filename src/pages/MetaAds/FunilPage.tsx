import { useState, useMemo } from 'react';
import { AlertTriangle, AlertCircle, CheckCircle, Info, ChevronDown, ChevronRight } from 'lucide-react';
import { useCampaigns } from '@/hooks/useMetaAds';
import { DateRangeSelector } from '@/components/DateRangeSelector';
import { StatusFilter, matchesStatusFilter, type StatusFilterValue } from '@/components/StatusFilter';
import { classifyFunnelStage, STAGE_LABELS } from '@/lib/classify';
import { generateFunnelInsights, type Insight, type StageData } from '@/lib/insights';
import { fmtCurrency, fmtCompact, fmtPct, fmtNumber } from '@/lib/formatters';
import { Badge, statusToBadgeVariant, statusLabel } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import type { DatePreset, Campaign } from '@/types/meta';

const STAGE_COLORS = {
  topo: '#2383E2',
  meio: '#787774',
  fundo: '#37352F',
  desconhecido: '#9B9A97',
};

const STAGE_EMOJIS = {
  topo: '🔵',
  meio: '🟡',
  fundo: '🟢',
  desconhecido: '⚪',
};

const INSIGHT_COLORS = {
  warning: '#D9730D',
  alert: '#E03E3E',
  success: '#0F7B6C',
  info: '#2383E2',
};

function InsightIcon({ type }: { type: Insight['type'] }) {
  const size = 16;
  const color = INSIGHT_COLORS[type];
  if (type === 'warning') return <AlertTriangle size={size} style={{ color }} />;
  if (type === 'alert') return <AlertCircle size={size} style={{ color }} />;
  if (type === 'success') return <CheckCircle size={size} style={{ color }} />;
  return <Info size={size} style={{ color }} />;
}

function InsightCard({ insight }: { insight: Insight }) {
  return (
    <div
      className="bg-notion-bg-primary rounded p-4"
      style={{ borderLeft: `3px solid ${INSIGHT_COLORS[insight.type]}` }}
    >
      <div className="flex items-start gap-2.5">
        <div className="flex-shrink-0 mt-0.5">
          <InsightIcon type={insight.type} />
        </div>
        <div>
          <p className="text-sm font-bold text-notion-text-primary mb-1">{insight.title}</p>
          <p className="text-[13px] text-notion-text-secondary leading-relaxed">{insight.body}</p>
        </div>
      </div>
    </div>
  );
}

function buildStageData(campaigns: Campaign[], stage: string, label: string): StageData {
  const filtered = campaigns.filter((c) => classifyFunnelStage(c) === stage);
  let spend = 0;
  let impressions = 0;
  let clicks = 0;
  let reach = 0;
  let weightedCtr = 0;
  let weightedCpm = 0;
  let weightedCpc = 0;
  let totalSpendForAvg = 0;

  for (const c of filtered) {
    const ins = c.insights?.data?.[0];
    if (!ins) continue;
    const s = Number(ins.spend || 0);
    spend += s;
    impressions += Number(ins.impressions || 0);
    clicks += Number(ins.clicks || 0);
    reach += Number(ins.reach || 0);
    weightedCtr += Number(ins.ctr || 0) * s;
    weightedCpm += Number(ins.cpm || 0) * s;
    weightedCpc += Number(ins.cpc || 0) * s;
    totalSpendForAvg += s;
  }

  const ctr = totalSpendForAvg > 0 ? weightedCtr / totalSpendForAvg : 0;
  const cpm = totalSpendForAvg > 0 ? weightedCpm / totalSpendForAvg : 0;
  const cpc = totalSpendForAvg > 0 ? weightedCpc / totalSpendForAvg : 0;

  return { label, spend, impressions, clicks, reach, ctr, cpm, cpc, count: filtered.length };
}

interface StageCardProps {
  stage: 'topo' | 'meio' | 'fundo' | 'desconhecido';
  data: StageData;
  totalSpend: number;
  campaigns: Campaign[];
  datePreset: DatePreset;
}

function StageCard({ stage, data, totalSpend }: StageCardProps) {
  const color = STAGE_COLORS[stage];
  const pct = totalSpend > 0 ? (data.spend / totalSpend) * 100 : 0;

  return (
    <div className="bg-notion-bg-primary rounded shadow-notion-md p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{STAGE_EMOJIS[stage]}</span>
          <span className="text-sm font-semibold text-notion-text-primary">
            {STAGE_LABELS[stage]}
          </span>
        </div>
        <span
          className="text-xs font-medium px-2 py-0.5 rounded-sm"
          style={{ background: `${color}18`, color }}
        >
          {data.count} camp.
        </span>
      </div>

      <div>
        <p className="text-2xl font-bold text-notion-text-primary tabular-nums">
          {fmtCurrency(data.spend)}
        </p>
        <div className="mt-2">
          <div className="flex justify-between text-xs text-notion-text-tertiary mb-1">
            <span>{pct.toFixed(1)}% do total</span>
          </div>
          <div className="h-1.5 bg-notion-bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(pct, 100)}%`, background: color }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-1 border-t border-notion-border">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-notion-text-tertiary font-medium">
            Impressões
          </p>
          <p className="text-sm text-notion-text-primary tabular-nums">{fmtCompact(data.impressions)}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-notion-text-tertiary font-medium">
            Alcance
          </p>
          <p className="text-sm text-notion-text-primary tabular-nums">{fmtCompact(data.reach)}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-notion-text-tertiary font-medium">
            Cliques
          </p>
          <p className="text-sm text-notion-text-primary tabular-nums">{fmtNumber(data.clicks)}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-notion-text-tertiary font-medium">
            CTR médio
          </p>
          <p className="text-sm text-notion-text-primary tabular-nums">{fmtPct(data.ctr)}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-notion-text-tertiary font-medium">
            CPM médio
          </p>
          <p className="text-sm text-notion-text-primary tabular-nums">{fmtCurrency(data.cpm)}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-notion-text-tertiary font-medium">
            CPC médio
          </p>
          <p className="text-sm text-notion-text-primary tabular-nums">{fmtCurrency(data.cpc)}</p>
        </div>
      </div>
    </div>
  );
}

function BudgetAllocationBar({
  topo,
  meio,
  fundo,
  desconhecido,
  total,
}: {
  topo: number;
  meio: number;
  fundo: number;
  desconhecido: number;
  total: number;
}) {
  if (total === 0) return null;
  const pctTopo = (topo / total) * 100;
  const pctMeio = (meio / total) * 100;
  const pctFundo = (fundo / total) * 100;
  const pctDesc = (desconhecido / total) * 100;

  return (
    <div className="bg-notion-bg-primary rounded shadow-notion-md p-5">
      <h3 className="text-sm font-semibold text-notion-text-primary mb-4">
        Distribuição de Orçamento
      </h3>
      <div className="flex h-6 rounded overflow-hidden gap-0.5">
        {pctTopo > 0 && (
          <div
            className="h-full flex items-center justify-center text-[10px] text-white font-medium"
            style={{ width: `${pctTopo}%`, background: STAGE_COLORS.topo }}
            title={`Topo: ${pctTopo.toFixed(1)}%`}
          >
            {pctTopo > 8 ? `${pctTopo.toFixed(0)}%` : ''}
          </div>
        )}
        {pctMeio > 0 && (
          <div
            className="h-full flex items-center justify-center text-[10px] text-white font-medium"
            style={{ width: `${pctMeio}%`, background: STAGE_COLORS.meio }}
            title={`Meio: ${pctMeio.toFixed(1)}%`}
          >
            {pctMeio > 8 ? `${pctMeio.toFixed(0)}%` : ''}
          </div>
        )}
        {pctFundo > 0 && (
          <div
            className="h-full flex items-center justify-center text-[10px] text-white font-medium"
            style={{ width: `${pctFundo}%`, background: STAGE_COLORS.fundo }}
            title={`Fundo: ${pctFundo.toFixed(1)}%`}
          >
            {pctFundo > 8 ? `${pctFundo.toFixed(0)}%` : ''}
          </div>
        )}
        {pctDesc > 0 && (
          <div
            className="h-full flex items-center justify-center text-[10px] text-white font-medium"
            style={{ width: `${pctDesc}%`, background: STAGE_COLORS.desconhecido }}
            title={`Não classificado: ${pctDesc.toFixed(1)}%`}
          >
            {pctDesc > 8 ? `${pctDesc.toFixed(0)}%` : ''}
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-4 mt-3">
        {[
          { key: 'topo' as const, pct: pctTopo },
          { key: 'meio' as const, pct: pctMeio },
          { key: 'fundo' as const, pct: pctFundo },
          { key: 'desconhecido' as const, pct: pctDesc },
        ]
          .filter((s) => s.pct > 0)
          .map((s) => (
            <div key={s.key} className="flex items-center gap-1.5">
              <div
                className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                style={{ background: STAGE_COLORS[s.key] }}
              />
              <span className="text-xs text-notion-text-secondary">
                {STAGE_LABELS[s.key]} — {s.pct.toFixed(1)}%
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}

function StageCampaignsTable({
  stage,
  campaigns,
}: {
  stage: 'topo' | 'meio' | 'fundo' | 'desconhecido';
  campaigns: Campaign[];
}) {
  const [open, setOpen] = useState(false);
  const filtered = campaigns.filter((c) => classifyFunnelStage(c) === stage);

  if (filtered.length === 0) return null;

  const color = STAGE_COLORS[stage];

  return (
    <div className="bg-notion-bg-primary rounded shadow-notion-md overflow-hidden">
      <button
        className="w-full px-5 py-3 flex items-center justify-between hover:bg-notion-bg-secondary transition-colors duration-[120ms]"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex items-center gap-2">
          <span>{STAGE_EMOJIS[stage]}</span>
          <span className="text-sm font-semibold text-notion-text-primary">
            {STAGE_LABELS[stage]}
          </span>
          <span
            className="text-xs px-1.5 py-0.5 rounded-sm font-medium"
            style={{ background: `${color}18`, color }}
          >
            {filtered.length}
          </span>
        </div>
        {open ? (
          <ChevronDown size={14} className="text-notion-text-tertiary" />
        ) : (
          <ChevronRight size={14} className="text-notion-text-tertiary" />
        )}
      </button>
      {open && (
        <div className="overflow-x-auto border-t border-notion-border">
          <table className="w-full border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-notion-border bg-notion-bg-secondary/50">
                <th className="px-3 py-2.5 text-left text-xs font-medium text-notion-text-secondary">
                  Nome
                </th>
                <th className="px-3 py-2.5 text-left text-xs font-medium text-notion-text-secondary">
                  Status
                </th>
                <th className="px-3 py-2.5 text-right text-xs font-medium text-notion-text-secondary">
                  Investimento
                </th>
                <th className="px-3 py-2.5 text-right text-xs font-medium text-notion-text-secondary">
                  Impressões
                </th>
                <th className="px-3 py-2.5 text-right text-xs font-medium text-notion-text-secondary">
                  Cliques
                </th>
                <th className="px-3 py-2.5 text-right text-xs font-medium text-notion-text-secondary">
                  CTR
                </th>
                <th className="px-3 py-2.5 text-right text-xs font-medium text-notion-text-secondary">
                  CPM
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const ins = c.insights?.data?.[0];
                return (
                  <tr
                    key={c.id}
                    className="border-b border-notion-border hover:bg-notion-bg-secondary transition-colors duration-[60ms]"
                  >
                    <td className="px-3 py-2.5 max-w-[260px]">
                      <p
                        className="text-sm text-notion-text-primary truncate"
                        title={c.name}
                      >
                        {c.name}
                      </p>
                    </td>
                    <td className="px-3 py-2.5">
                      <Badge variant={statusToBadgeVariant(c.effective_status)}>
                        {statusLabel(c.effective_status)}
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
                      {ins ? fmtCurrency(ins.cpm) : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function FunilPage() {
  const [datePreset, setDatePreset] = useState<DatePreset>('last_30d');
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>('all');
  const { data: campaignsData, isLoading } = useCampaigns(datePreset);
  const allCampaigns = campaignsData?.data ?? [];
  const campaigns = useMemo(
    () => allCampaigns.filter((c) => matchesStatusFilter(c.effective_status, statusFilter)),
    [allCampaigns, statusFilter]
  );

  const { topoData, meioData, fundoData, descData, totalSpend } = useMemo(() => {
    const t = buildStageData(campaigns, 'topo', STAGE_LABELS.topo);
    const m = buildStageData(campaigns, 'meio', STAGE_LABELS.meio);
    const f = buildStageData(campaigns, 'fundo', STAGE_LABELS.fundo);
    const d = buildStageData(campaigns, 'desconhecido', STAGE_LABELS.desconhecido);
    return {
      topoData: t,
      meioData: m,
      fundoData: f,
      descData: d,
      totalSpend: t.spend + m.spend + f.spend + d.spend,
    };
  }, [campaigns]);

  const insights = useMemo(
    () => generateFunnelInsights(topoData, meioData, fundoData),
    [topoData, meioData, fundoData]
  );

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-notion-bg-secondary border-b border-notion-border px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-notion-text-primary tracking-tight">
              Análise por Funil
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
        {/* Stage Cards */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="bg-notion-bg-primary rounded shadow-notion-md p-5 space-y-3">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-8 w-40" />
                <Skeleton className="h-2 w-full rounded-full" />
                <div className="grid grid-cols-2 gap-2">
                  {[0, 1, 2, 3].map((j) => (
                    <Skeleton key={j} className="h-8" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StageCard stage="topo" data={topoData} totalSpend={totalSpend} campaigns={campaigns} datePreset={datePreset} />
            <StageCard stage="meio" data={meioData} totalSpend={totalSpend} campaigns={campaigns} datePreset={datePreset} />
            <StageCard stage="fundo" data={fundoData} totalSpend={totalSpend} campaigns={campaigns} datePreset={datePreset} />
          </div>
        )}

        {/* Budget Allocation Bar */}
        {!isLoading && totalSpend > 0 && (
          <BudgetAllocationBar
            topo={topoData.spend}
            meio={meioData.spend}
            fundo={fundoData.spend}
            desconhecido={descData.spend}
            total={totalSpend}
          />
        )}

        {/* Insights */}
        {!isLoading && insights.length > 0 && (
          <div>
            <h2 className="text-base font-semibold text-notion-text-primary mb-3">
              Inteligência
            </h2>
            <div className="space-y-3">
              {insights.map((ins, i) => (
                <InsightCard key={i} insight={ins} />
              ))}
            </div>
          </div>
        )}

        {/* Campaigns per stage */}
        {!isLoading && campaigns.length > 0 && (
          <div>
            <h2 className="text-base font-semibold text-notion-text-primary mb-3">
              Campanhas por Estágio
            </h2>
            <div className="space-y-3">
              <StageCampaignsTable stage="topo" campaigns={campaigns} />
              <StageCampaignsTable stage="meio" campaigns={campaigns} />
              <StageCampaignsTable stage="fundo" campaigns={campaigns} />
              <StageCampaignsTable stage="desconhecido" campaigns={campaigns} />
            </div>
          </div>
        )}

        {!isLoading && campaigns.length === 0 && (
          <div className="bg-notion-bg-primary rounded shadow-notion-md px-5 py-10 text-center">
            <p className="text-sm text-notion-text-tertiary">
              Nenhuma campanha encontrada para o período selecionado.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
