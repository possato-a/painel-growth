import { useState, useEffect } from 'react';
import {
  BookOpen, CheckCircle, XCircle, ArrowRight, Database, Globe,
  Hash, Ban, GitMerge, MapPin, Zap, ChevronRight,
} from 'lucide-react';

// ─── Data ─────────────────────────────────────────────────────────────────────

interface Stage {
  color: string; bg: string; border: string;
  label: string; icon: string; tagline: string;
  description: string; criteria: string[]; dataRequired: string[];
  note?: string;
}

const STAGES: Stage[] = [
  {
    color: '#2383E2', bg: '#EBF4FF', border: '#BFDBFE',
    label: 'LEAD', icon: '📋',
    tagline: 'Cadastrou em algum canal de meio de funil',
    description: 'Pessoa que se cadastrou em um dos canais de meio de funil — Webinar, Simulador Financeiro ou Comunidade. Ainda não sabemos se tem capital disponível ou se está em uma praça atendida pela Be Honest.',
    criteria: ['Realizou cadastro em Webinar, Simulador Financeiro ou Comunidade', 'Capital e praça ainda não confirmados'],
    dataRequired: ['Nome completo', 'Telefone', 'E-mail', 'Cidade'],
  },
  {
    color: '#9333EA', bg: '#F5F3FF', border: '#DDD6FE',
    label: 'PRÉ-MQL', icon: '🔍',
    tagline: 'Confirmou capital + está na praça, mas ainda não pediu conversa',
    description: 'Lead que confirmou que tem capital disponível para investir e está em uma praça atendida pela Be Honest. Demonstra interesse real, mas ainda não realizou a "levantada de mão" para falar com o time comercial.',
    criteria: ['Capital disponível para investimento confirmado', 'Localizado em praça atendida pela Be Honest', 'Ainda não solicitou contato com o comercial'],
    dataRequired: ['Tudo do Lead', 'Confirmação de disponibilidade de investimento', 'Cidade validada na praça'],
  },
  {
    color: '#0F7B6C', bg: '#ECFDF5', border: '#A7F3D0',
    label: 'MQL', icon: '🙋',
    tagline: 'Está na praça, tem capital e pediu conversa com o comercial',
    description: 'Lead que completou os três critérios: está na praça, tem capital e fez a levantada de mão — pediu ativamente para conversar com o time comercial. Pode chegar via evolução de Pré-MQL ou diretamente do fundo de funil (Meta Ads / Google).',
    criteria: ['Está em praça atendida pela Be Honest', 'Capital disponível confirmado', 'Solicitou contato com o time comercial (levantada de mão)'],
    dataRequired: ['Tudo do Pré-MQL', 'Registro da levantada de mão (data e canal)'],
    note: 'Pode vir diretamente do fundo de funil (Meta Ads / Google) ou evoluir a partir de um Pré-MQL.',
  },
  {
    color: '#D97706', bg: '#FFFBEB', border: '#FDE68A',
    label: 'MQL RECUSADO', icon: '⛔',
    tagline: 'Converteu no fundo de funil mas não atende os critérios mínimos',
    description: 'Lead que converteu diretamente no fundo de funil (fez a levantada de mão), mas foi descartado pelo time comercial por não estar na praça ou não ter capital disponível — ou os dois.',
    criteria: ['Converteu no fundo de funil', 'Não está na praça atendida OU não tem capital disponível'],
    dataRequired: ['Dados do lead', 'Motivo de recusa (praça, capital ou ambos)'],
  },
  {
    color: '#E03E3E', bg: '#FFF5F5', border: '#FECACA',
    label: 'LEAD PERDIDO', icon: '📍',
    tagline: 'Cadastrou em meio de funil mas está em cidade sem Be Honest',
    description: 'Lead que converteu em um canal de meio de funil (Webinar, Simulador ou Comunidade), porém está localizado em uma cidade onde a Be Honest ainda não tem franquia ou não está em expansão.',
    criteria: ['Cadastrado em canal de meio de funil', 'Cidade não atendida pela rede Be Honest'],
    dataRequired: ['Dados do Lead', 'Cidade (fora da praça)'],
  },
];

const TOC_ITEMS = [
  { id: 'visao-geral',   label: 'Visão Geral' },
  { id: 'estagios',      label: 'Estágios de Lead' },
  { id: 'resumo',        label: 'Resumo Comparativo' },
  { id: 'fontes',        label: 'Fontes de Dados' },
  { id: 'paginas',       label: 'Páginas & Canal' },
  { id: 'id-lead',       label: 'Regras de ID' },
  { id: 'exclusoes',     label: 'Exclusões' },
  { id: 'cidades',       label: 'Cidades de Operação' },
  { id: 'auto-evolucao', label: 'Auto-Evolução' },
  { id: 'sync',          label: 'Sincronização do CRM' },
];

// ─── Primitives ───────────────────────────────────────────────────────────────

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="font-mono text-[12px] bg-notion-bg-secondary border border-notion-border px-1.5 py-0.5 rounded text-notion-text-primary">
      {children}
    </code>
  );
}

type CalloutType = 'info' | 'success' | 'warning' | 'danger';

const C_STYLE: Record<CalloutType, { border: string; bg: string; color: string; icon: string }> = {
  info:    { border: '#2383E2', bg: '#EBF4FF', color: '#2383E2', icon: 'ℹ' },
  success: { border: '#0F7B6C', bg: '#ECFDF5', color: '#0F7B6C', icon: '✓' },
  warning: { border: '#D97706', bg: '#FFFBEB', color: '#D97706', icon: '⚠' },
  danger:  { border: '#E03E3E', bg: '#FFF5F5', color: '#E03E3E', icon: '✕' },
};

function Callout({
  type = 'info',
  title,
  children,
}: {
  type?: CalloutType;
  title?: string;
  children: React.ReactNode;
}) {
  const s = C_STYLE[type];
  return (
    <div
      className="flex items-start gap-3 px-4 py-3 rounded-r-md"
      style={{ borderLeft: `3px solid ${s.border}`, background: s.bg }}
    >
      <span className="font-bold flex-shrink-0 mt-px" style={{ color: s.color }}>{s.icon}</span>
      <div className="min-w-0">
        {title && (
          <p className="font-semibold text-[13px] mb-0.5" style={{ color: s.color }}>{title}</p>
        )}
        <div className="text-[13px] text-notion-text-secondary leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

function SectionHeading({
  id,
  icon,
  title,
}: {
  id: string;
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div
      id={id}
      className="flex items-center gap-2.5 pb-3 mb-5 border-b border-notion-border scroll-mt-14"
    >
      <span className="text-notion-primary">{icon}</span>
      <h2 className="text-[15px] font-semibold text-notion-text-primary">{title}</h2>
    </div>
  );
}

// ─── Stage Card ───────────────────────────────────────────────────────────────

function StageCard({ stage }: { stage: Stage }) {
  return (
    <div
      className="rounded-lg border border-notion-border overflow-hidden"
      style={{ borderLeftColor: stage.color, borderLeftWidth: '3px' }}
    >
      <div className="px-4 py-3 flex items-center gap-3 bg-notion-bg-secondary border-b border-notion-border">
        <span className="text-xl flex-shrink-0">{stage.icon}</span>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-[11px] font-bold tracking-widest uppercase px-2 py-0.5 rounded text-white"
              style={{ background: stage.color }}
            >
              {stage.label}
            </span>
          </div>
          <p className="text-[12px] font-medium mt-0.5" style={{ color: stage.color }}>
            {stage.tagline}
          </p>
        </div>
      </div>

      <div className="px-4 py-4 bg-notion-bg-primary space-y-4">
        <p className="text-[13px] text-notion-text-secondary leading-relaxed">{stage.description}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-notion-text-tertiary mb-2">
              Critérios
            </p>
            <ul className="space-y-1.5">
              {stage.criteria.map((c, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle size={12} className="flex-shrink-0 mt-0.5" style={{ color: stage.color }} />
                  <span className="text-[12px] text-notion-text-primary leading-snug">{c}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-notion-text-tertiary mb-2">
              Dados capturados
            </p>
            <ul className="space-y-1.5">
              {stage.dataRequired.map((d, i) => (
                <li key={i} className="flex items-start gap-2">
                  <div
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5"
                    style={{ background: stage.color }}
                  />
                  <span className="text-[12px] text-notion-text-primary leading-snug">{d}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {stage.note && <Callout type="info">{stage.note}</Callout>}
      </div>
    </div>
  );
}

// ─── Funnel Diagram ───────────────────────────────────────────────────────────

function FunnelDiagram() {
  const steps = [
    { label: 'LEAD', color: '#2383E2', icon: '📋' },
    { label: 'PRÉ-MQL', color: '#9333EA', icon: '🔍' },
    { label: 'MQL', color: '#0F7B6C', icon: '🙋' },
  ];

  return (
    <div className="bg-notion-bg-secondary rounded-lg border border-notion-border p-5 space-y-4">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-notion-text-tertiary mb-3">
          Fluxo principal
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          {steps.map((s, i) => (
            <>
              <div
                key={s.label}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-[12px] font-semibold"
                style={{ background: s.color }}
              >
                <span>{s.icon}</span>
                <span>{s.label}</span>
              </div>
              {i < steps.length - 1 && (
                <ArrowRight size={14} className="text-notion-text-tertiary flex-shrink-0" />
              )}
            </>
          ))}
        </div>
      </div>

      <div className="pt-3 border-t border-notion-border">
        <p className="text-[10px] font-bold uppercase tracking-widest text-notion-text-tertiary mb-2">
          Saídas do funil
        </p>
        <div className="flex flex-wrap gap-4">
          {[
            { label: 'MQL RECUSADO', color: '#D97706', icon: '⛔', from: 'fundo de funil' },
            { label: 'LEAD PERDIDO', color: '#E03E3E', icon: '📍', from: 'meio de funil' },
          ].map((e) => (
            <div key={e.label} className="flex items-center gap-1.5">
              <XCircle size={12} style={{ color: e.color }} />
              <span
                className="text-[12px] font-medium px-2 py-0.5 rounded"
                style={{ background: `${e.color}18`, color: e.color }}
              >
                {e.icon} {e.label}
              </span>
              <span className="text-[11px] text-notion-text-tertiary">via {e.from}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── On This Page TOC ─────────────────────────────────────────────────────────

function useActiveSection(ids: string[]): string {
  const [activeId, setActiveId] = useState(ids[0] ?? '');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) setActiveId(visible[0].target.id);
      },
      { rootMargin: '-8% 0% -82% 0%' },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [ids]);

  return activeId;
}

function OnThisPage({ activeId }: { activeId: string }) {
  return (
    <nav className="pt-6 px-4 pb-10">
      <p className="text-[10px] font-bold uppercase tracking-widest text-notion-text-tertiary mb-3">
        Nesta página
      </p>
      <ul className="space-y-0.5">
        {TOC_ITEMS.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={`flex items-center gap-2 text-[12px] py-1 px-2 rounded transition-colors duration-100 ${
                activeId === item.id
                  ? 'text-notion-primary font-medium bg-notion-bg-secondary'
                  : 'text-notion-text-secondary hover:text-notion-text-primary hover:bg-notion-bg-secondary'
              }`}
            >
              {activeId === item.id && (
                <span className="w-1 h-1 rounded-full bg-notion-primary flex-shrink-0" />
              )}
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export function DocsPage() {
  const activeId = useActiveSection(TOC_ITEMS.map((t) => t.id));

  return (
    <div className="min-h-screen flex flex-col">

      {/* ── Breadcrumb header ─────────────────────────────────── */}
      <div className="sticky top-0 z-10 bg-notion-bg-secondary border-b border-notion-border px-8 py-3 flex items-center gap-1.5 text-[12px]">
        <BookOpen size={12} className="text-notion-text-tertiary flex-shrink-0" />
        <span className="text-notion-text-tertiary">Documentação</span>
        <ChevronRight size={11} className="text-notion-text-tertiary" />
        <span className="text-notion-text-tertiary">CRM</span>
        <ChevronRight size={11} className="text-notion-text-tertiary" />
        <span className="text-notion-text-primary font-medium">Classificação de Leads</span>
      </div>

      {/* ── Two-column body ───────────────────────────────────── */}
      <div className="flex flex-1">

        {/* Content */}
        <div className="flex-1 min-w-0 px-8 py-8">
          <div className="max-w-[760px] space-y-14">

            {/* Page heading */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-[#EBF4FF] text-[#2383E2] border border-[#BFDBFE]">
                  CRM
                </span>
              </div>
              <h1 className="text-[24px] font-bold text-notion-text-primary mb-2 leading-tight">
                Classificação de Leads
              </h1>
              <p className="text-[14px] text-notion-text-secondary leading-relaxed max-w-[600px]">
                Define os estágios pelos quais um lead passa desde o primeiro contato até a qualificação
                comercial. A classificação determina a régua de comunicação, a prioridade do time
                comercial e os critérios de descarte.
              </p>
              <div className="flex items-center gap-3 mt-4 pt-4 border-t border-notion-border">
                <span className="text-[11px] text-notion-text-tertiary">Be Honest Franquia</span>
                <span className="text-notion-text-tertiary text-[10px]">·</span>
                <span className="text-[11px] text-notion-text-tertiary">Atualizado mar/2026</span>
              </div>
            </div>

            {/* ── 1. Visão Geral ──────────────────────────────── */}
            <section>
              <SectionHeading id="visao-geral" icon={<BookOpen size={15} />} title="Visão Geral" />
              <FunnelDiagram />
            </section>

            {/* ── 2. Estágios de Lead ─────────────────────────── */}
            <section>
              <SectionHeading id="estagios" icon={<CheckCircle size={15} />} title="Estágios de Lead" />
              <div className="space-y-4">
                {STAGES.map((stage) => (
                  <StageCard key={stage.label} stage={stage} />
                ))}
              </div>
            </section>

            {/* ── 3. Resumo Comparativo ───────────────────────── */}
            <section>
              <SectionHeading id="resumo" icon={<Hash size={15} />} title="Resumo Comparativo" />
              <div className="rounded-lg border border-notion-border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse min-w-[520px]">
                    <thead>
                      <tr className="bg-notion-bg-secondary border-b border-notion-border">
                        {['Estágio', 'Origem', 'Na praça?', 'Tem capital?', 'Pediu conversa?'].map((h) => (
                          <th
                            key={h}
                            className="px-4 py-2.5 text-left text-[11px] font-semibold text-notion-text-secondary uppercase tracking-wider"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { label: 'LEAD',          color: '#2383E2', origem: 'Meio de funil',          praca: '?', capital: '?', pediu: '—' },
                        { label: 'PRÉ-MQL',       color: '#9333EA', origem: 'Meio de funil',          praca: '✓', capital: '✓', pediu: '—' },
                        { label: 'MQL',           color: '#0F7B6C', origem: 'Meio ou fundo de funil', praca: '✓', capital: '✓', pediu: '✓' },
                        { label: 'MQL RECUSADO',  color: '#D97706', origem: 'Fundo de funil',         praca: '✗', capital: '✗', pediu: '✓' },
                        { label: 'LEAD PERDIDO',  color: '#E03E3E', origem: 'Meio de funil',          praca: '✗', capital: '?', pediu: '—' },
                      ].map((row) => (
                        <tr
                          key={row.label}
                          className="border-b border-notion-border last:border-0 hover:bg-notion-bg-secondary/50 transition-colors duration-[60ms]"
                        >
                          <td className="px-4 py-2.5">
                            <span
                              className="text-[11px] font-bold px-2 py-0.5 rounded"
                              style={{ background: `${row.color}18`, color: row.color }}
                            >
                              {row.label}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-[12px] text-notion-text-secondary">{row.origem}</td>
                          <td className="px-4 py-2.5 text-center text-[13px]">{row.praca}</td>
                          <td className="px-4 py-2.5 text-center text-[13px]">{row.capital}</td>
                          <td className="px-4 py-2.5 text-center text-[13px]">{row.pediu}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* ── 4. Fontes de Dados ──────────────────────────── */}
            <section>
              <SectionHeading id="fontes" icon={<Database size={15} />} title="Fontes de Dados" />
              <p className="text-[13px] text-notion-text-secondary mb-5 leading-relaxed -mt-2">
                O CRM lê dados de duas planilhas no Google Sheets. Todo lead presente no CRM enriquecido
                também existe na fonte primária.
              </p>
              <div className="space-y-4">
                {[
                  {
                    title: 'Leads Be Honest',
                    subtitle: 'Fonte da verdade — histórico completo de leads',
                    type: 'Fonte primária',
                    tab: 'Leads Franquia',
                    since: '04/07/2025',
                    color: '#2383E2',
                    bg: '#EBF4FF',
                    border: '#BFDBFE',
                    cols: ['Data', 'Hora', 'Nome e Sobrenome', 'Email', 'Celular', 'Cidade', 'Estado', 'Disponibilidade de Investimento', 'MQL?', 'Page', 'Source', 'Medium', 'Campaign', 'Content', 'Term'],
                    note: 'Automatizada — todos os novos leads chegam aqui automaticamente via integrações das landing pages.',
                  },
                  {
                    title: '[FRANQUIA]_Painel de Growth',
                    subtitle: 'CRM enriquecido — dados comerciais desde fev/2026',
                    type: 'CRM enriquecido',
                    tab: 'BASE_CRM',
                    since: '01/02/2026',
                    color: '#0F7B6C',
                    bg: '#ECFDF5',
                    border: '#A7F3D0',
                    cols: ['ID Lead', 'Data', 'Hora', 'Nome', 'Email', 'Celular', 'Cidade', 'Estado', 'Canal', 'Página', 'Source', 'Campanha', 'Conjunto', 'Criativo', 'Estágio', 'Investimento', 'Status Pipeline', 'Motivo de perda', 'Valor', 'Foco Captação'],
                    note: 'Subconjunto enriquecido da planilha acima. Estágio, Status Pipeline, Motivo de perda e Valor são preenchidos pelo time comercial e nunca sobrescritos pelo sync automático.',
                  },
                ].map((src) => (
                  <div
                    key={src.title}
                    className="rounded-lg border border-notion-border overflow-hidden"
                    style={{ borderLeftColor: src.color, borderLeftWidth: '3px' }}
                  >
                    {/* Header */}
                    <div className="px-5 py-3 bg-notion-bg-secondary border-b border-notion-border">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className="text-[11px] font-bold text-white px-2 py-0.5 rounded"
                          style={{ background: src.color }}
                        >
                          {src.title}
                        </span>
                        <span
                          className="text-[10px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider border"
                          style={{ color: src.color, background: src.bg, borderColor: src.border }}
                        >
                          {src.type}
                        </span>
                      </div>
                      <p className="text-[12px] font-medium mt-1.5" style={{ color: src.color }}>
                        {src.subtitle}
                      </p>
                    </div>

                    {/* Body */}
                    <div className="px-5 py-4 bg-notion-bg-primary space-y-4">
                      {/* Metadata row */}
                      <div className="flex items-center gap-4 text-[12px] text-notion-text-secondary">
                        <span>Aba: <Code>{src.tab}</Code></span>
                        <span className="text-notion-text-tertiary">·</span>
                        <span>Disponível desde <strong>{src.since}</strong></span>
                      </div>

                      {/* Columns */}
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-notion-text-tertiary mb-2">
                          Colunas disponíveis
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {src.cols.map((c) => (
                            <span
                              key={c}
                              className="text-[11px] font-mono bg-notion-bg-secondary border border-notion-border px-1.5 py-0.5 rounded text-notion-text-secondary"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>

                      <Callout type="info">{src.note}</Callout>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ── 5. Páginas e Canal ──────────────────────────── */}
            <section>
              <SectionHeading id="paginas" icon={<Globe size={15} />} title="Páginas e Classificação de Canal" />
              <p className="text-[13px] text-notion-text-secondary mb-5 leading-relaxed -mt-2">
                O campo <strong>Foco Captação</strong> é determinado automaticamente pela URL da página
                em que o lead converteu.
              </p>

              <div className="space-y-4">
                {[
                  {
                    type: 'CAPTAÇÃO MEIO',
                    color: '#9333EA',
                    border: '#DDD6FE',
                    desc: 'Webinar, Comunidade, Simulador Financeiro',
                    rows: [
                      { url: 'lp.behonest.com.br/',                      canal: 'Webinar' },
                      { url: 'lp.behonest.com.br/comunidade',             canal: 'Grupo Empreenda / Comunidade' },
                      { url: 'lp.behonest.com.br/simulador-financeiro',   canal: 'Simulador Financeiro' },
                    ],
                  },
                  {
                    type: 'CAPTAÇÃO FUNDO',
                    color: '#0F7B6C',
                    border: '#A7F3D0',
                    desc: 'Landing pages de conversão direta',
                    rows: [
                      { url: 'behonestbrasil.com.br/fazer-negocio-operador/',        canal: 'LP Operador — Meta Ads' },
                      { url: 'behonestbrasil.com.br/fazer-negocio-operador-google',  canal: 'LP Operador — Google Ads' },
                      { url: 'lp.behonest.com.br/meta',                             canal: 'LP Direta — Meta Ads' },
                      { url: 'lp.behonest.com.br/google',                           canal: 'LP Direta — Google Ads' },
                    ],
                  },
                  {
                    type: 'ESPECIAL',
                    color: '#D97706',
                    border: '#FDE68A',
                    desc: 'Captação de eventos e ações específicas',
                    rows: [
                      { url: 'lp.behonest.com.br/operacao-behonest', canal: 'Cadastro para evento presencial Be Honest' },
                      { url: 'lp.behonest.com.br/aulao-grupo',       canal: 'Cadastro no aulão semanal — exclusivo membros do Grupo Comunidade' },
                    ],
                  },
                ].map((group) => (
                  <div
                    key={group.type}
                    className="rounded-lg border border-notion-border overflow-hidden"
                    style={{ borderLeftColor: group.color, borderLeftWidth: '3px' }}
                  >
                    <div className="px-4 py-2.5 bg-notion-bg-secondary border-b border-notion-border flex items-center gap-2">
                      <span
                        className="text-[11px] font-bold tracking-widest uppercase px-2 py-0.5 rounded text-white"
                        style={{ background: group.color }}
                      >
                        {group.type}
                      </span>
                      <span className="text-[12px] text-notion-text-secondary">{group.desc}</span>
                    </div>
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-notion-border bg-notion-bg-primary">
                          <th className="px-4 py-2 text-left text-[11px] font-semibold text-notion-text-secondary uppercase tracking-wider w-1/2">
                            URL
                          </th>
                          <th className="px-4 py-2 text-left text-[11px] font-semibold text-notion-text-secondary uppercase tracking-wider">
                            Canal / Tipo
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.rows.map((row) => (
                          <tr
                            key={row.url}
                            className="border-b border-notion-border last:border-0 hover:bg-notion-bg-secondary/40 transition-colors duration-[60ms]"
                          >
                            <td className="px-4 py-2.5">
                              <Code>{row.url}</Code>
                            </td>
                            <td className="px-4 py-2.5 text-[12px] text-notion-text-secondary">
                              {row.canal}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            </section>

            {/* ── 6. Regras de ID ─────────────────────────────── */}
            <section>
              <SectionHeading id="id-lead" icon={<Hash size={15} />} title="Regras de ID" />
              <p className="text-[13px] text-notion-text-secondary mb-5 leading-relaxed -mt-2">
                O <strong>ID Lead</strong> é atribuído por <strong>e-mail</strong> — identifica a pessoa,
                não a conversão. O mesmo lead pode aparecer múltiplas vezes no CRM (uma linha por
                conversão), todas com o mesmo ID.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  className="rounded-lg border border-notion-border overflow-hidden"
                  style={{ borderLeftColor: '#0F7B6C', borderLeftWidth: '3px' }}
                >
                  <div className="px-4 py-2.5 bg-notion-bg-secondary border-b border-notion-border">
                    <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#0F7B6C' }}>
                      Comportamento esperado
                    </p>
                  </div>
                  <ul className="px-4 py-3 space-y-2">
                    {[
                      'Mesmo email = mesmo ID em todas as linhas',
                      'Conversões distintas = linhas separadas com o mesmo ID',
                      '2 conversões no mesmo dia = 2 registros com o mesmo ID',
                      'Reconversões rastreadas pela contagem de linhas por ID',
                    ].map((t, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle size={12} className="flex-shrink-0 mt-0.5" style={{ color: '#0F7B6C' }} />
                        <span className="text-[12px] text-notion-text-primary">{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div
                  className="rounded-lg border border-notion-border overflow-hidden"
                  style={{ borderLeftColor: '#E03E3E', borderLeftWidth: '3px' }}
                >
                  <div className="px-4 py-2.5 bg-notion-bg-secondary border-b border-notion-border">
                    <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#E03E3E' }}>
                      Nunca fazer
                    </p>
                  </div>
                  <ul className="px-4 py-3 space-y-2">
                    {[
                      'Criar ID novo para o mesmo email',
                      'Mesclar linhas de conversões diferentes num único registro',
                      'Usar data como critério de unicidade',
                    ].map((t, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <XCircle size={12} className="flex-shrink-0 mt-0.5" style={{ color: '#E03E3E' }} />
                        <span className="text-[12px] text-notion-text-primary">{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            {/* ── 7. Exclusões ────────────────────────────────── */}
            <section>
              <SectionHeading id="exclusoes" icon={<Ban size={15} />} title="Exclusões — Filtros de Qualidade" />
              <p className="text-[13px] text-notion-text-secondary mb-5 leading-relaxed -mt-2">
                Os registros abaixo são automaticamente excluídos do CRM durante a sincronização e não
                aparecem em nenhuma contagem, tabela ou relatório.
              </p>

              <div className="space-y-3">
                <div className="rounded-lg border border-notion-border overflow-hidden">
                  <div className="px-4 py-2.5 bg-notion-bg-secondary border-b border-notion-border">
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-notion-text-tertiary">
                      Pessoas excluídas (por nome ou email)
                    </p>
                  </div>
                  <div className="px-4 py-3 flex flex-wrap gap-2">
                    {['Francisco Possato', 'Carlos Fernandes', 'João Gabriel dos Santos dos Anjos'].map((name) => (
                      <span
                        key={name}
                        className="inline-flex items-center gap-1.5 text-[12px] font-medium px-2.5 py-1 rounded-full border"
                        style={{ background: '#FFF5F5', borderColor: '#FECACA', color: '#E03E3E' }}
                      >
                        <XCircle size={11} />
                        {name}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg border border-notion-border overflow-hidden">
                  <div className="px-4 py-2.5 bg-notion-bg-secondary border-b border-notion-border">
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-notion-text-tertiary">
                      Entradas de teste
                    </p>
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-[13px] text-notion-text-secondary leading-relaxed">
                      Qualquer lead cujo nome ou email contenha{' '}
                      <Code>teste</Code>, <Code>test</Code> ou <Code>@test</Code>{' '}
                      (comparação case-insensitive) é descartado automaticamente.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* ── 8. Cidades de Operação ──────────────────────── */}
            <section>
              <SectionHeading id="cidades" icon={<MapPin size={15} />} title="Cidades de Operação (Praça)" />
              <p className="text-[13px] text-notion-text-secondary mb-5 leading-relaxed -mt-2">
                Um lead é considerado <strong>"na praça"</strong> quando sua cidade está na lista abaixo.
                Leads fora da praça são classificados como <strong>LEAD PERDIDO</strong> (meio de funil)
                ou <strong>MQL RECUSADO</strong> (fundo de funil).
              </p>

              <div className="space-y-3 mb-4">
                {[
                  {
                    state: 'Minas Gerais (MG)',
                    color: '#2383E2', border: '#BFDBFE', bg: '#EBF4FF',
                    groups: [
                      { label: 'Franquias', cities: ['Belo Horizonte', 'Nova Lima', 'Contagem', 'Betim', 'Ribeirão das Neves', 'Santa Luzia', 'Sabará', 'Ibirité', 'Vespasiano', 'Lagoa Santa', 'Pedro Leopoldo', 'Sete Lagoas', 'Juiz de Fora', 'Uberlândia', 'Uberaba'] },
                      { label: 'Emergentes', cities: ['Governador Valadares', 'Montes Claros', 'Poços de Caldas', 'Pouso Alegre', 'Divinópolis', 'Ipatinga', 'Barbacena'] },
                    ],
                  },
                  {
                    state: 'Goiás (GO)',
                    color: '#0F7B6C', border: '#A7F3D0', bg: '#ECFDF5',
                    groups: [
                      { label: 'Franquias', cities: ['Goiânia', 'Aparecida de Goiânia', 'Anápolis'] },
                      { label: 'Emergentes', cities: ['Rio Verde', 'Catalão'] },
                    ],
                  },
                  {
                    state: 'Distrito Federal (DF)',
                    color: '#9333EA', border: '#DDD6FE', bg: '#F5F3FF',
                    groups: [
                      { label: 'Franquias', cities: ['Brasília', 'Taguatinga', 'Ceilândia', 'Águas Claras'] },
                    ],
                  },
                ].map((region) => (
                  <div
                    key={region.state}
                    className="rounded-lg border border-notion-border overflow-hidden"
                    style={{ borderLeftColor: region.color, borderLeftWidth: '3px' }}
                  >
                    <div className="px-4 py-2.5 bg-notion-bg-secondary border-b border-notion-border">
                      <span className="text-[12px] font-bold" style={{ color: region.color }}>
                        {region.state}
                      </span>
                    </div>
                    <div className="px-4 py-3 bg-notion-bg-primary space-y-3">
                      {region.groups.map((g) => (
                        <div key={g.label}>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-notion-text-tertiary mb-1.5">
                            {g.label}
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {g.cities.map((c) => (
                              <span
                                key={c}
                                className="text-[11px] font-medium px-2 py-0.5 rounded border"
                                style={{ background: region.bg, color: region.color, borderColor: region.border }}
                              >
                                {c}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <Callout type="warning">
                Cidades marcadas como <strong>BID</strong> (Business Intelligence Discovery) são usadas
                apenas para análise interna e <strong>não</strong> classificam leads como "na praça".
              </Callout>
            </section>

            {/* ── 9. Auto-Evolução ────────────────────────────── */}
            <section>
              <SectionHeading id="auto-evolucao" icon={<Zap size={15} />} title="Auto-Evolução de Estágio" />
              <p className="text-[13px] text-notion-text-secondary mb-6 leading-relaxed -mt-2">
                A cada sincronização, o sistema agrupa leads por email e cruza dados de{' '}
                <strong>todas as conversões</strong> para determinar se o lead evoluiu de estágio.
                Isso acontece automaticamente — ex.: um lead que converteu no Webinar (meio de funil)
                e depois no fundo de funil (levantada de mão) é promovido para MQL.
              </p>

              <div className="space-y-6">

                {/* Três critérios */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-notion-text-tertiary mb-3">
                    Três critérios avaliados (cross-conversão)
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                      { label: 'Na Praça',         desc: 'Pelo menos uma conversão do lead tem cidade dentro da praça', color: '#2383E2', bg: '#EBF4FF', border: '#BFDBFE', icon: '📍' },
                      { label: 'Tem Capital',       desc: 'Pelo menos uma conversão indica disponibilidade de investimento', color: '#9333EA', bg: '#F5F3FF', border: '#DDD6FE', icon: '💰' },
                      { label: 'Levantada de Mão',  desc: 'Pelo menos uma conversão foi em página de fundo de funil', color: '#0F7B6C', bg: '#ECFDF5', border: '#A7F3D0', icon: '🙋' },
                    ].map((c) => (
                      <div
                        key={c.label}
                        className="rounded-lg border p-4 text-center"
                        style={{ borderColor: c.border, background: c.bg }}
                      >
                        <span className="text-2xl">{c.icon}</span>
                        <p className="text-[12px] font-bold mt-2" style={{ color: c.color }}>{c.label}</p>
                        <p className="text-[11px] text-notion-text-secondary mt-1 leading-snug">{c.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tabela meio de funil */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-notion-text-tertiary mb-2">
                    Regras de evolução — Meio de Funil
                  </p>
                  <div className="rounded-lg border border-notion-border overflow-hidden">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-notion-bg-secondary border-b border-notion-border">
                          {['Na Praça', 'Capital', 'Levantou Mão', 'Resultado'].map((h) => (
                            <th
                              key={h}
                              className="px-4 py-2.5 text-left text-[11px] font-semibold text-notion-text-secondary uppercase tracking-wider"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { praca: '✗', capital: '—', mao: '—', result: 'LEAD PERDIDO', rColor: '#E03E3E' },
                          { praca: '✓', capital: '✗', mao: '—', result: 'LEAD',         rColor: '#2383E2' },
                          { praca: '✓', capital: '✓', mao: '✗', result: 'PRÉ-MQL',      rColor: '#9333EA' },
                          { praca: '✓', capital: '✓', mao: '✓', result: 'MQL',          rColor: '#0F7B6C' },
                        ].map((r, i) => (
                          <tr
                            key={i}
                            className="border-b border-notion-border last:border-0 hover:bg-notion-bg-secondary/50 transition-colors duration-[60ms]"
                          >
                            <td className="px-4 py-2.5 text-[13px]">{r.praca}</td>
                            <td className="px-4 py-2.5 text-[13px]">{r.capital}</td>
                            <td className="px-4 py-2.5 text-[13px]">{r.mao}</td>
                            <td className="px-4 py-2.5">
                              <span
                                className="text-[11px] font-bold px-2 py-0.5 rounded"
                                style={{ color: r.rColor, background: `${r.rColor}18` }}
                              >
                                {r.result}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Tabela fundo de funil */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-notion-text-tertiary mb-2">
                    Regras de evolução — Fundo de Funil
                  </p>
                  <div className="rounded-lg border border-notion-border overflow-hidden">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-notion-bg-secondary border-b border-notion-border">
                          {['Na Praça', 'Capital', 'Resultado'].map((h) => (
                            <th
                              key={h}
                              className="px-4 py-2.5 text-left text-[11px] font-semibold text-notion-text-secondary uppercase tracking-wider"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { praca: '✓',       capital: '✓',       result: 'MQL',          rColor: '#0F7B6C' },
                          { praca: '✗ ou ✗',  capital: '✗ ou ✗',  result: 'MQL RECUSADO', rColor: '#D97706' },
                        ].map((r, i) => (
                          <tr
                            key={i}
                            className="border-b border-notion-border last:border-0 hover:bg-notion-bg-secondary/50 transition-colors duration-[60ms]"
                          >
                            <td className="px-4 py-2.5 text-[13px]">{r.praca}</td>
                            <td className="px-4 py-2.5 text-[13px]">{r.capital}</td>
                            <td className="px-4 py-2.5">
                              <span
                                className="text-[11px] font-bold px-2 py-0.5 rounded"
                                style={{ color: r.rColor, background: `${r.rColor}18` }}
                              >
                                {r.result}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Callouts */}
                <div className="space-y-2">
                  <Callout type="success">
                    Estágios <strong>nunca regridem</strong> automaticamente. Um lead que já é MQL não
                    volta para PRÉ-MQL.
                  </Callout>
                  <Callout type="warning">
                    Estágios comerciais (CONEXÃO, REUNIÃO FINANCEIRA, SQL, etc.){' '}
                    <strong>nunca são sobrescritos</strong> pela auto-evolução. Esses são definidos
                    exclusivamente pelo time comercial.
                  </Callout>
                </div>
              </div>
            </section>

            {/* ── 10. Sincronização do CRM ────────────────────── */}
            <section>
              <SectionHeading id="sync" icon={<GitMerge size={15} />} title="Sincronização do CRM" />
              <p className="text-[13px] text-notion-text-secondary mb-6 leading-relaxed -mt-2">
                O script <Code>scripts/crm-sync.js</Code> roda periodicamente e atualiza o CRM interno
                com novos leads provenientes de "Leads Be Honest". O resultado é salvo em duas fontes
                (Google Sheets + backend local).
              </p>

              {/* Timeline */}
              <div>
                {[
                  { step: '1', title: 'Leitura da fonte',               color: '#2383E2', desc: 'Lê toda a aba "Leads Franquia" da planilha "Leads Be Honest" (todas as linhas desde 04/07/2025).' },
                  { step: '2', title: 'Filtragem de qualidade',          color: '#E03E3E', desc: 'Remove entradas de teste e os três nomes/emails da lista de exclusão.' },
                  { step: '3', title: 'Atribuição de ID',                color: '#9333EA', desc: 'Atribui ID por email — mesmo ID para mesma pessoa; múltiplas conversões geram múltiplas linhas com o mesmo ID.' },
                  { step: '4', title: 'Foco Captação',                   color: '#D97706', desc: 'Determina "CAPTAÇÃO MEIO", "CAPTAÇÃO FUNDO" ou "ESPECIAL" pela URL da página de conversão.' },
                  { step: '5', title: 'Classificação de Estágio',        color: '#0F7B6C', desc: 'Aplica as regras de LEAD / PRÉ-MQL / MQL / MQL RECUSADO / LEAD PERDIDO conforme os critérios de praça, capital e levantada de mão.' },
                  { step: '6', title: 'Preservação dos dados comerciais', color: '#2383E2', desc: 'Para leads já existentes, mantém os dados preenchidos pelo comercial (Status Pipeline, Motivo de perda, Valor). Esses campos nunca são sobrescritos pelo sync automático.' },
                  { step: '7', title: 'Persistência dupla',              color: '#0F7B6C', desc: 'Escreve o resultado normalizado na aba "CRM_PAINEL" do [FRANQUIA]_Painel de Growth (Google Sheets) e no backend local do painel para exibição na interface.' },
                ].map((s, i, arr) => (
                  <div key={s.step} className="flex gap-4">
                    {/* Line + circle */}
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[12px] font-bold z-10"
                        style={{ background: s.color }}
                      >
                        {s.step}
                      </div>
                      {i < arr.length - 1 && (
                        <div
                          className="w-px flex-1 mt-1 mb-1"
                          style={{ background: `${s.color}30`, minHeight: '20px' }}
                        />
                      )}
                    </div>

                    {/* Content */}
                    <div className="pb-6 flex-1 min-w-0 pt-0.5">
                      <p
                        className="text-[13px] font-semibold mb-0.5"
                        style={{ color: s.color }}
                      >
                        {s.title}
                      </p>
                      <p className="text-[13px] text-notion-text-secondary leading-relaxed">
                        {s.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

          </div>
        </div>

        {/* ── Right TOC ─────────────────────────────────────── */}
        <aside className="hidden xl:block w-52 shrink-0 border-l border-notion-border">
          <div className="sticky top-[45px] max-h-[calc(100vh-45px)] overflow-y-auto">
            <OnThisPage activeId={activeId} />
          </div>
        </aside>

      </div>
    </div>
  );
}
