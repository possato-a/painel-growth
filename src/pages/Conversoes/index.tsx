import { useState } from 'react';
import {
  Users, DollarSign, TrendingDown, MousePointer,
  ChevronDown, ChevronRight, ExternalLink, AlertCircle, Info, Link2,
} from 'lucide-react';
import { useConversoes, type ConvPage, type ConvCampaign } from '@/hooks/useConversoes';
import { DateRangeSelector } from '@/components/DateRangeSelector';
import { Skeleton } from '@/components/ui/Skeleton';
import { fmtCurrency, fmtNumber, fmtPct } from '@/lib/formatters';
import type { DateRange } from '@/types/meta';

// ── KPI Card ──────────────────────────────────────────────────────────────────
function KpiCard({
  label, value, sub, icon: Icon, primary, loading,
}: {
  label: string; value: string; sub?: string;
  icon: React.ElementType; primary?: boolean; loading?: boolean;
}) {
  if (loading) return (
    <div className="bg-notion-bg-primary rounded shadow-notion-md p-5">
      <Skeleton className="h-3 w-20 mb-3" />
      <Skeleton className="h-7 w-28" />
    </div>
  );
  return (
    <div className={`bg-notion-bg-primary rounded shadow-notion-md p-5 relative ${primary ? 'ring-1 ring-notion-primary/20' : ''}`}>
      <div className="absolute top-4 right-4">
        <Icon size={16} className="text-notion-text-tertiary" />
      </div>
      <p className="text-xs font-medium text-notion-text-secondary uppercase tracking-wider mb-2 pr-6">{label}</p>
      <p className={`font-bold text-notion-text-primary leading-none ${primary ? 'text-2xl' : 'text-xl'}`}>{value}</p>
      {sub && <p className="text-xs text-notion-text-tertiary mt-1.5">{sub}</p>}
    </div>
  );
}

// ── Status pill ───────────────────────────────────────────────────────────────
function StatusPill({ status }: { status: string }) {
  const active = status === 'ACTIVE';
  return (
    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${
      active
        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
        : 'bg-notion-bg-secondary text-notion-text-tertiary border-notion-border'
    }`}>
      {active ? 'Ativa' : status}
    </span>
  );
}

// ── LP chip ────────────────────────────────────────────────────────────────────
function LpChip({ url }: { url: string }) {
  const label = url.replace(/https?:\/\/[^/]+/, '') || url;
  return (
    <a
      href={url.startsWith('http') ? url : `https://${url}`}
      target="_blank" rel="noopener noreferrer"
      onClick={e => e.stopPropagation()}
      className="inline-flex items-center gap-1 text-[10px] font-mono text-notion-primary bg-[#EBF4FF] border border-[#BFDBFE] px-1.5 py-0.5 rounded hover:underline max-w-[200px] truncate"
      title={url}
    >
      <Link2 size={9} className="shrink-0" />
      <span className="truncate">{label || url}</span>
    </a>
  );
}

// ── Lead proportion bar ───────────────────────────────────────────────────────
function LeadBar({ pct }: { pct: number }) {
  return (
    <div className="flex items-center gap-2 min-w-[90px]">
      <div className="flex-1 h-1.5 bg-notion-bg-tertiary rounded-full overflow-hidden">
        <div className="h-full rounded-full bg-notion-primary" style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
      <span className="text-[11px] text-notion-text-tertiary w-9 text-right shrink-0">{pct.toFixed(1)}%</span>
    </div>
  );
}

// ── Section header ────────────────────────────────────────────────────────────
function SectionHeader({ title, count, note }: { title: string; count?: number; note?: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <h2 className="text-[15px] font-semibold text-notion-text-primary">{title}</h2>
      {count !== undefined && (
        <span className="text-[11px] text-notion-text-tertiary bg-notion-bg-secondary border border-notion-border px-2 py-0.5 rounded-full">
          {count}
        </span>
      )}
      {note && <span className="text-[11px] text-notion-text-tertiary">{note}</span>}
    </div>
  );
}

// ── Table header cell ─────────────────────────────────────────────────────────
function TH({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-notion-text-secondary uppercase tracking-wider">
      {children}
    </th>
  );
}

// ── By Page table ─────────────────────────────────────────────────────────────
function PageTable({
  rows, totalLeads, loading, campaignNames,
}: {
  rows: ConvPage[]; totalLeads: number; loading: boolean;
  campaignNames: Record<string, string>;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (loading) return (
    <div className="space-y-2">{[1,2,3,4].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
  );
  if (!rows.length) return (
    <p className="text-sm text-notion-text-tertiary py-6 text-center">
      Nenhuma página com tráfego pago identificada no período
    </p>
  );

  return (
    <div className="rounded-lg border border-notion-border overflow-hidden">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-notion-bg-secondary border-b border-notion-border">
            <TH>Página</TH>
            <TH>Leads</TH>
            <TH>% do total</TH>
            <TH>Investimento</TH>
            <TH>Cliques</TH>
            <TH>Viz. Página</TH>
            <TH>Abertura LP</TH>
            <TH>CPL</TH>
            <TH>Conv. Rate</TH>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const pct = totalLeads > 0 ? (row.leads / totalLeads) * 100 : 0;
            const isExp = expanded === (row.page || '__sem_pagina__');
            const key = row.page || '__sem_pagina__';
            return (
              <>
                <tr
                  key={key}
                  className="border-b border-notion-border last:border-0 hover:bg-notion-bg-secondary/40 transition-colors cursor-pointer"
                  onClick={() => setExpanded(isExp ? null : key)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-notion-text-tertiary">
                        {isExp ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                      </span>
                      <div>
                        <p className="text-[13px] font-semibold text-notion-text-primary">{row.label}</p>
                        {row.page && (
                          <p className="text-[11px] text-notion-text-tertiary font-mono truncate max-w-[240px]">
                            {row.page.replace(/https?:\/\/[^/]+/, '')}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[15px] font-bold text-notion-text-primary">{row.leads}</span>
                  </td>
                  <td className="px-4 py-3">
                    <LeadBar pct={pct} />
                  </td>
                  <td className="px-4 py-3 text-[13px] text-notion-text-secondary">
                    {row.spend > 0 ? fmtCurrency(row.spend) : <span className="text-notion-text-tertiary">—</span>}
                  </td>
                  <td className="px-4 py-3 text-[13px] text-notion-text-secondary">
                    {row.clicks > 0 ? fmtNumber(Math.round(row.clicks)) : <span className="text-notion-text-tertiary">—</span>}
                  </td>
                  <td className="px-4 py-3 text-[13px] text-notion-text-secondary">
                    {row.landing_page_views > 0 ? fmtNumber(Math.round(row.landing_page_views)) : <span className="text-notion-text-tertiary">—</span>}
                  </td>
                  <td className="px-4 py-3 text-[13px] text-notion-text-secondary">
                    {row.openRate != null ? fmtPct(row.openRate) : <span className="text-notion-text-tertiary">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    {row.cpl != null
                      ? <span className="text-[13px] font-bold text-notion-text-primary">{fmtCurrency(row.cpl)}</span>
                      : <span className="text-notion-text-tertiary">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    {row.convRate != null
                      ? <span className="text-[13px] text-notion-text-secondary">{fmtPct(row.convRate)}</span>
                      : <span className="text-notion-text-tertiary">—</span>}
                  </td>
                </tr>

                {isExp && (
                  <tr key={`${key}_detail`} className="bg-notion-bg-secondary border-b border-notion-border">
                    <td colSpan={9} className="px-8 py-3">
                      <div className="flex items-start gap-8">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-notion-text-tertiary mb-1.5">
                            Campanhas que geraram tráfego
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {row.campaigns.length === 0 ? (
                              <span className="text-[12px] text-notion-text-tertiary italic">—</span>
                            ) : row.campaigns.map(id => (
                              <span key={id} className="text-[11px] bg-notion-bg-primary border border-notion-border px-2 py-0.5 rounded text-notion-text-secondary">
                                {campaignNames[id] ?? id}
                              </span>
                            ))}
                          </div>
                        </div>
                        {row.page && row.page !== '{native-form}' && (
                          <a
                            href={row.page.startsWith('http') ? row.page : `https://${row.page}`}
                            target="_blank" rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                            className="flex items-center gap-1 text-[11px] text-notion-primary hover:underline mt-0.5 shrink-0"
                          >
                            <ExternalLink size={10} /> Ver página
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── By Campaign table ─────────────────────────────────────────────────────────
function CampaignTable({ rows, loading }: { rows: ConvCampaign[]; loading: boolean }) {
  if (loading) return (
    <div className="space-y-2">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
  );
  if (!rows.length) return (
    <p className="text-sm text-notion-text-tertiary py-6 text-center">
      Nenhuma campanha de leads com leads vinculados no período
    </p>
  );

  return (
    <div className="rounded-lg border border-notion-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-notion-bg-secondary border-b border-notion-border">
              <TH>Campanha</TH>
              <TH>Status</TH>
              <TH>Leads</TH>
              <TH>Investimento</TH>
              <TH>CPL</TH>
              <TH>Cliques</TH>
              <TH>Viz. Página</TH>
              <TH>Abertura LP</TH>
              <TH>Conv. Rate</TH>
              <TH>CTR</TH>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row.metaId} className="border-b border-notion-border last:border-0 hover:bg-notion-bg-secondary/40 transition-colors align-top">
                <td className="px-4 py-3 max-w-[220px]">
                  <p className="text-[13px] font-medium text-notion-text-primary" title={row.metaName}>
                    {row.metaName}
                  </p>
                  {row.lps.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {row.lps.map(lp => <LpChip key={lp} url={lp} />)}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3"><StatusPill status={row.metaStatus} /></td>
                <td className="px-4 py-3">
                  <span className="text-[15px] font-bold text-notion-text-primary">{row.leads}</span>
                </td>
                <td className="px-4 py-3 text-[13px] text-notion-text-secondary">
                  {row.spend > 0 ? fmtCurrency(row.spend) : '—'}
                </td>
                <td className="px-4 py-3">
                  {row.cpl != null
                    ? <span className="text-[13px] font-bold text-notion-text-primary">{fmtCurrency(row.cpl)}</span>
                    : <span className="text-notion-text-tertiary">—</span>}
                </td>
                <td className="px-4 py-3 text-[13px] text-notion-text-secondary">
                  {row.clicks > 0 ? fmtNumber(row.clicks) : '—'}
                </td>
                <td className="px-4 py-3 text-[13px] text-notion-text-secondary">
                  {row.landing_page_views > 0 ? fmtNumber(row.landing_page_views) : '—'}
                </td>
                <td className="px-4 py-3 text-[13px] text-notion-text-secondary">
                  {row.openRate != null ? fmtPct(row.openRate) : '—'}
                </td>
                <td className="px-4 py-3 text-[13px] text-notion-text-secondary">
                  {row.convRate != null ? fmtPct(row.convRate) : '—'}
                </td>
                <td className="px-4 py-3 text-[13px] text-notion-text-secondary">
                  {row.ctr > 0 ? fmtPct(row.ctr) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export function ConversoesPage() {
  const [dateRange, setDateRange] = useState<DateRange>('last_30d');
  const { data, isLoading, error } = useConversoes(dateRange);

  const totals = data?.totals;

  // Build id→name map for use in page table
  const campaignNames: Record<string, string> = {};
  for (const c of data?.byCampaign ?? []) {
    campaignNames[c.metaId] = c.metaName;
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-notion-bg-secondary border-b border-notion-border px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-notion-text-primary tracking-tight">Conversões</h1>
            <span className="text-xs font-medium text-notion-text-secondary bg-notion-bg-primary border border-notion-border px-2.5 py-1 rounded-sm">
              Meta Ads · Geração de Leads
            </span>
          </div>
          <DateRangeSelector value={dateRange} onChange={setDateRange} />
        </div>
      </div>

      <div className="px-8 py-6 space-y-8">
        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 p-4 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">
            <AlertCircle size={16} className="shrink-0" />
            <span>Erro ao carregar dados: {error.message}</span>
          </div>
        )}

        {/* KPI cards */}
        <section>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <KpiCard
              label="Total de Leads"
              value={totals ? fmtNumber(totals.leads) : '—'}
              sub="Planilha Leads Be Honest"
              icon={Users}
              primary
              loading={isLoading}
            />
            <KpiCard
              label="Investimento"
              value={totals ? fmtCurrency(totals.spend) : '—'}
              sub="Campanhas de leads no Meta"
              icon={DollarSign}
              loading={isLoading}
            />
            <KpiCard
              label="CPL Médio"
              value={totals?.cpl != null ? fmtCurrency(totals.cpl) : '—'}
              sub="Invest. ÷ Leads (planilha)"
              icon={TrendingDown}
              loading={isLoading}
            />
            <KpiCard
              label="Taxa de Conversão"
              value={totals?.convRate != null ? fmtPct(totals.convRate) : '—'}
              sub="Leads ÷ Visualiz. de página"
              icon={MousePointer}
              loading={isLoading}
            />
          </div>
        </section>

        {/* Methodology note */}
        {!isLoading && data && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-lg border border-notion-border bg-notion-bg-secondary text-[12px] text-notion-text-secondary leading-relaxed">
            <Info size={13} className="text-notion-text-tertiary shrink-0 mt-0.5" />
            <span>
              Somente campanhas com objetivo <strong className="text-notion-text-primary">Geração de Leads</strong> no Meta são consideradas.
              Leads contados da planilha <strong className="text-notion-text-primary">Leads Be Honest</strong> — vinculados às campanhas pelo campo{' '}
              <code className="font-mono text-[11px] bg-notion-bg-tertiary px-1 rounded">utm_campaign</code>.{' '}
              <strong className="text-notion-text-primary">Abertura LP</strong> = Viz. de página ÷ Cliques (pessoas que clicaram e carregaram a página).{' '}
              <strong className="text-notion-text-primary">Conv. Rate</strong> = Leads ÷ Viz. de página.{' '}
              Invest., Cliques e Viz. de página por LP são <strong className="text-notion-text-primary">exatos</strong> — extraídos a nível de anúncio cruzando o URL de destino de cada criativo (via <code className="font-mono text-[11px] bg-notion-bg-tertiary px-1 rounded">object_story_spec</code>).
              {(data.metaNoLeads?.length ?? 0) > 0 && (
                <span className="text-amber-600">
                  {' '}{data.metaNoLeads.length} campanha(s) de leads sem leads vinculados na planilha no período.
                </span>
              )}
            </span>
          </div>
        )}

        {/* Por Landing Page */}
        <section>
          <SectionHeader
            title="Por Landing Page"
            count={data?.byPage.length}
            note="apenas páginas com tráfego pago"
          />
          <PageTable
            rows={data?.byPage ?? []}
            totalLeads={totals?.leads ?? 0}
            loading={isLoading}
            campaignNames={campaignNames}
          />
        </section>

        {/* Por Campanha */}
        <section>
          <SectionHeader
            title="Por Campanha"
            count={data?.byCampaign.length}
            note="objetivo: geração de leads"
          />
          <CampaignTable rows={data?.byCampaign ?? []} loading={isLoading} />
        </section>

        {/* Leads campaigns with no CRM leads */}
        {!isLoading && (data?.metaNoLeads.length ?? 0) > 0 && (
          <section>
            <SectionHeader
              title="Campanhas de leads sem leads vinculados"
              count={data!.metaNoLeads.length}
            />
            <p className="text-[12px] text-notion-text-tertiary mb-3">
              Estas campanhas têm objetivo de leads no Meta mas nenhum lead na planilha tem{' '}
              <code className="font-mono text-[11px] bg-notion-bg-secondary px-1 rounded">utm_campaign</code>{' '}
              com o ID ou nome correspondente. Verifique se o UTM está configurado corretamente.
            </p>
            <div className="rounded-lg border border-notion-border overflow-hidden">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-notion-bg-secondary border-b border-notion-border">
                    {['Campanha', 'Status', 'Invest.', 'Cliques', 'CTR', 'CPM'].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold text-notion-text-secondary uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data!.metaNoLeads.map(mc => (
                    <tr key={mc.id} className="border-b border-notion-border last:border-0 hover:bg-notion-bg-secondary/40 transition-colors">
                      <td className="px-4 py-3 max-w-[220px]">
                        <p className="text-[13px] text-notion-text-primary truncate" title={mc.name}>{mc.name}</p>
                        <p className="text-[10px] text-notion-text-tertiary font-mono mt-0.5">{mc.id}</p>
                      </td>
                      <td className="px-4 py-3"><StatusPill status={mc.status} /></td>
                      <td className="px-4 py-3 text-[13px] text-notion-text-secondary">{mc.spend > 0 ? fmtCurrency(mc.spend) : '—'}</td>
                      <td className="px-4 py-3 text-[13px] text-notion-text-secondary">{mc.clicks > 0 ? fmtNumber(mc.clicks) : '—'}</td>
                      <td className="px-4 py-3 text-[13px] text-notion-text-secondary">{mc.ctr > 0 ? fmtPct(mc.ctr) : '—'}</td>
                      <td className="px-4 py-3 text-[13px] text-notion-text-secondary">{mc.cpm > 0 ? fmtCurrency(mc.cpm) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
