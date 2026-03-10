import { BookOpen, CheckCircle, XCircle, ArrowRight, Database, Globe, Hash, Ban, GitMerge } from 'lucide-react';

interface StageProps {
  color: string;
  bg: string;
  border: string;
  label: string;
  icon: React.ReactNode;
  tagline: string;
  description: string;
  criteria: string[];
  dataRequired: string[];
  note?: string;
}

const STAGES: StageProps[] = [
  {
    color: '#2383E2',
    bg: '#EBF4FF',
    border: '#BFDBFE',
    label: 'LEAD',
    icon: '📋',
    tagline: 'Cadastrou em algum canal de meio de funil',
    description:
      'Pessoa que se cadastrou em um dos canais de meio de funil — Webinar, Simulador Financeiro ou Comunidade. Ainda não sabemos se tem capital disponível ou se está em uma praça atendida pela Be Honest.',
    criteria: [
      'Realizou cadastro em Webinar, Simulador Financeiro ou Comunidade',
      'Capital e praça ainda não confirmados',
    ],
    dataRequired: ['Nome completo', 'Telefone', 'E-mail', 'Cidade'],
  },
  {
    color: '#9333EA',
    bg: '#F5F3FF',
    border: '#DDD6FE',
    label: 'PRÉ-MQL',
    icon: '🔍',
    tagline: 'Confirmou capital + está na praça, mas ainda não pediu conversa',
    description:
      'Lead que confirmou que tem capital disponível para investir e está em uma praça atendida pela Be Honest. Demonstra interesse real, mas ainda não realizou a "levantada de mão" para falar com o time comercial.',
    criteria: [
      'Capital disponível para investimento confirmado',
      'Localizado em praça atendida pela Be Honest',
      'Ainda não solicitou contato com o comercial',
    ],
    dataRequired: [
      'Tudo do Lead',
      'Confirmação de disponibilidade de investimento',
      'Cidade validada na praça',
    ],
  },
  {
    color: '#0F7B6C',
    bg: '#ECFDF5',
    border: '#A7F3D0',
    label: 'MQL',
    icon: '🙋',
    tagline: 'Está na praça, tem capital e pediu conversa com o comercial',
    description:
      'Lead que completou os três critérios: está na praça, tem capital e fez a levantada de mão — pediu ativamente para conversar com o time comercial. Pode chegar via evolução de Pré-MQL ou diretamente do fundo de funil (Meta Ads / Google).',
    criteria: [
      'Está em praça atendida pela Be Honest',
      'Capital disponível confirmado',
      'Solicitou contato com o time comercial (levantada de mão)',
    ],
    dataRequired: [
      'Tudo do Pré-MQL',
      'Registro da levantada de mão (data e canal)',
    ],
    note: 'Pode vir diretamente do fundo de funil (Meta Ads / Google) ou evoluir a partir de um Pré-MQL.',
  },
  {
    color: '#D97706',
    bg: '#FFFBEB',
    border: '#FDE68A',
    label: 'MQL RECUSADO',
    icon: '⛔',
    tagline: 'Converteu no fundo de funil mas não atende os critérios mínimos',
    description:
      'Lead que converteu diretamente no fundo de funil (fez a levantada de mão), mas foi descartado pelo time comercial por não estar na praça ou não ter capital disponível — ou os dois.',
    criteria: [
      'Converteu no fundo de funil',
      'Não está na praça atendida OU não tem capital disponível',
    ],
    dataRequired: ['Dados do lead', 'Motivo de recusa (praça, capital ou ambos)'],
  },
  {
    color: '#E03E3E',
    bg: '#FFF5F5',
    border: '#FECACA',
    label: 'LEAD PERDIDO',
    icon: '📍',
    tagline: 'Cadastrou em meio de funil mas está em cidade sem Be Honest',
    description:
      'Lead que converteu em um canal de meio de funil (Webinar, Simulador ou Comunidade), porém está localizado em uma cidade onde a Be Honest ainda não tem franquia ou não está em expansão.',
    criteria: [
      'Cadastrado em canal de meio de funil',
      'Cidade não atendida pela rede Be Honest',
    ],
    dataRequired: ['Dados do Lead', 'Cidade (fora da praça)'],
  },
];

function StageCard({ stage }: { stage: StageProps }) {
  return (
    <div
      className="rounded-lg overflow-hidden border"
      style={{ borderColor: stage.border }}
    >
      {/* Header */}
      <div
        className="px-5 py-4 flex items-center gap-3"
        style={{ background: stage.bg, borderBottom: `1px solid ${stage.border}` }}
      >
        <span className="text-2xl">{stage.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-xs font-bold tracking-widest uppercase px-2 py-0.5 rounded"
              style={{ background: stage.color, color: '#fff' }}
            >
              {stage.label}
            </span>
          </div>
          <p className="text-sm font-medium mt-1" style={{ color: stage.color }}>
            {stage.tagline}
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="px-5 py-4 bg-notion-bg-primary space-y-4">
        <p className="text-[13px] text-notion-text-secondary leading-relaxed">
          {stage.description}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Critérios */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-notion-text-tertiary mb-2">
              Critérios
            </p>
            <ul className="space-y-1.5">
              {stage.criteria.map((c, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle
                    size={13}
                    className="flex-shrink-0 mt-0.5"
                    style={{ color: stage.color }}
                  />
                  <span className="text-[12px] text-notion-text-primary leading-snug">{c}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Dados necessários */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-notion-text-tertiary mb-2">
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

        {stage.note && (
          <div
            className="flex items-start gap-2 px-3 py-2 rounded text-[12px]"
            style={{ background: stage.bg, color: stage.color, border: `1px solid ${stage.border}` }}
          >
            <span className="flex-shrink-0 font-bold">ℹ</span>
            <span>{stage.note}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function FunnelDiagram() {
  const steps = [
    { label: 'LEAD', color: '#2383E2', icon: '📋' },
    { label: 'PRÉ-MQL', color: '#9333EA', icon: '🔍' },
    { label: 'MQL', color: '#0F7B6C', icon: '🙋' },
  ];
  const exits = [
    { label: 'MQL RECUSADO', color: '#D97706', icon: '⛔', from: 'fundo de funil' },
    { label: 'LEAD PERDIDO', color: '#E03E3E', icon: '📍', from: 'meio de funil' },
  ];

  return (
    <div className="bg-notion-bg-primary rounded-lg shadow-notion-md p-5">
      <h2 className="text-sm font-semibold text-notion-text-primary mb-4">
        Fluxo de Classificação
      </h2>

      {/* Main flow */}
      <div className="flex items-center gap-2 flex-wrap">
        {steps.map((s, i) => (
          <div key={s.label} className="flex items-center gap-2">
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-xs font-semibold"
              style={{ background: s.color }}
            >
              <span>{s.icon}</span>
              <span>{s.label}</span>
            </div>
            {i < steps.length - 1 && (
              <ArrowRight size={14} className="text-notion-text-tertiary flex-shrink-0" />
            )}
          </div>
        ))}
      </div>

      {/* Exit paths */}
      <div className="mt-4 pt-4 border-t border-notion-border">
        <p className="text-[11px] font-medium text-notion-text-tertiary uppercase tracking-wide mb-2">
          Saídas do funil
        </p>
        <div className="flex flex-wrap gap-3">
          {exits.map((e) => (
            <div key={e.label} className="flex items-center gap-1.5">
              <XCircle size={12} style={{ color: e.color }} />
              <span
                className="text-xs font-medium px-2 py-0.5 rounded"
                style={{ background: `${e.color}15`, color: e.color }}
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

export function DocsPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-notion-bg-secondary border-b border-notion-border px-8 py-4">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-notion-text-primary tracking-tight">
            Documentação
          </h1>
          <span className="text-xs font-medium text-notion-text-secondary bg-notion-bg-primary border border-notion-border px-2.5 py-1 rounded-sm">
            Be Honest Franquia
          </span>
        </div>
      </div>

      <div className="px-8 py-6 space-y-6 max-w-4xl">

        {/* Intro */}
        <div className="flex items-start gap-3 bg-notion-bg-primary rounded-lg shadow-notion-md p-5">
          <BookOpen size={18} className="text-notion-primary flex-shrink-0 mt-0.5" />
          <div>
            <h2 className="text-sm font-semibold text-notion-text-primary mb-1">
              Classificação de Leads — CRM Franquia
            </h2>
            <p className="text-[13px] text-notion-text-secondary leading-relaxed">
              Define os estágios pelos quais um lead passa desde o primeiro contato
              até a qualificação comercial. A classificação determina a régua de
              comunicação, a prioridade do time comercial e os critérios de descarte.
            </p>
          </div>
        </div>

        {/* Fluxo visual */}
        <FunnelDiagram />

        {/* Estágios detalhados */}
        <div>
          <h2 className="text-base font-semibold text-notion-text-primary mb-3">
            Estágios em Detalhe
          </h2>
          <div className="space-y-4">
            {STAGES.map((stage) => (
              <StageCard key={stage.label} stage={stage} />
            ))}
          </div>
        </div>

        {/* Tabela resumo */}
        <div className="bg-notion-bg-primary rounded-lg shadow-notion-md overflow-hidden">
          <div className="px-5 py-4 border-b border-notion-border">
            <h2 className="text-sm font-semibold text-notion-text-primary">Resumo Comparativo</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-notion-border bg-notion-bg-secondary/50">
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-notion-text-secondary">Estágio</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-notion-text-secondary">Origem</th>
                  <th className="px-4 py-2.5 text-center text-xs font-medium text-notion-text-secondary">Na praça?</th>
                  <th className="px-4 py-2.5 text-center text-xs font-medium text-notion-text-secondary">Tem capital?</th>
                  <th className="px-4 py-2.5 text-center text-xs font-medium text-notion-text-secondary">Pediu conversa?</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { label: 'LEAD', color: '#2383E2', origem: 'Meio de funil', praca: '?', capital: '?', pediu: '—' },
                  { label: 'PRÉ-MQL', color: '#9333EA', origem: 'Meio de funil', praca: '✓', capital: '✓', pediu: '—' },
                  { label: 'MQL', color: '#0F7B6C', origem: 'Meio ou fundo de funil', praca: '✓', capital: '✓', pediu: '✓' },
                  { label: 'MQL RECUSADO', color: '#D97706', origem: 'Fundo de funil', praca: '✗', capital: '✗', pediu: '✓' },
                  { label: 'LEAD PERDIDO', color: '#E03E3E', origem: 'Meio de funil', praca: '✗', capital: '?', pediu: '—' },
                ].map((row) => (
                  <tr key={row.label} className="border-b border-notion-border hover:bg-notion-bg-secondary transition-colors duration-[60ms]">
                    <td className="px-4 py-2.5">
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded"
                        style={{ background: `${row.color}15`, color: row.color }}
                      >
                        {row.label}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-[12px] text-notion-text-secondary">{row.origem}</td>
                    <td className="px-4 py-2.5 text-center text-sm">{row.praca}</td>
                    <td className="px-4 py-2.5 text-center text-sm">{row.capital}</td>
                    <td className="px-4 py-2.5 text-center text-sm">{row.pediu}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── FONTES DE DADOS ─────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Database size={15} className="text-notion-primary" />
            <h2 className="text-base font-semibold text-notion-text-primary">Fontes de Dados</h2>
          </div>
          <div className="space-y-3">
            {[
              {
                title: 'Leads Be Honest',
                subtitle: 'Fonte da verdade — histórico completo de leads',
                tab: 'Leads Franquia',
                since: '04/07/2025',
                color: '#2383E2',
                bg: '#EBF4FF',
                border: '#BFDBFE',
                cols: ['Data', 'Hora', 'Nome e Sobrenome', 'Email', 'Celular', 'Cidade', 'Estado', 'Disponibilidade de Investimento', 'MQL?', 'Page', 'Source', 'Medium', 'Campaign', 'Content', 'Term'],
                note: 'Automatizada — todos os novos leads caem aqui automaticamente via integrações das landing pages.',
              },
              {
                title: '[FRANQUIA]_Painel de Growth',
                subtitle: 'CRM enriquecido — dados comerciais desde fev/2026',
                tab: 'BASE_CRM',
                since: '01/02/2026',
                color: '#0F7B6C',
                bg: '#ECFDF5',
                border: '#A7F3D0',
                cols: ['ID Lead', 'Data', 'Hora', 'Nome', 'Email', 'Celular', 'Cidade', 'Estado', 'Canal', 'Página', 'Source', 'Campanha', 'Conjunto', 'Criativo', 'Estágio', 'Investimento', 'Status Pipeline', 'Motivo de perda', 'Valor', 'Foco Captação'],
                note: 'Subconjunto enriquecido da planilha acima. Todo lead aqui também existe em "Leads Be Honest". Estágio, Status Pipeline, Motivo de perda e Valor são preenchidos pelo time comercial.',
              },
            ].map((src) => (
              <div key={src.title} className="rounded-lg border overflow-hidden" style={{ borderColor: src.border }}>
                <div className="px-5 py-3 flex items-start gap-3" style={{ background: src.bg, borderBottom: `1px solid ${src.border}` }}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold px-2 py-0.5 rounded text-white" style={{ background: src.color }}>{src.title}</span>
                      <span className="text-[11px] text-notion-text-tertiary">aba: <code className="font-mono bg-notion-bg-primary px-1 rounded">{src.tab}</code></span>
                      <span className="text-[11px] text-notion-text-tertiary">desde {src.since}</span>
                    </div>
                    <p className="text-[12px] mt-1 font-medium" style={{ color: src.color }}>{src.subtitle}</p>
                  </div>
                </div>
                <div className="px-5 py-3 bg-notion-bg-primary space-y-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-notion-text-tertiary mb-1.5">Colunas</p>
                    <div className="flex flex-wrap gap-1.5">
                      {src.cols.map((c) => (
                        <span key={c} className="text-[11px] font-mono bg-notion-bg-secondary border border-notion-border px-1.5 py-0.5 rounded text-notion-text-secondary">{c}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-start gap-1.5 px-3 py-2 rounded text-[12px]" style={{ background: src.bg, color: src.color, border: `1px solid ${src.border}` }}>
                    <span className="font-bold flex-shrink-0">ℹ</span>
                    <span>{src.note}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── PÁGINAS E CLASSIFICAÇÃO DE CANAL ─────────────────── */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Globe size={15} className="text-notion-primary" />
            <h2 className="text-base font-semibold text-notion-text-primary">Páginas e Classificação de Canal</h2>
          </div>
          <p className="text-[13px] text-notion-text-secondary mb-4 leading-relaxed">
            O campo <strong>Foco Captação</strong> é determinado automaticamente pela URL da página em que o lead converteu.
          </p>

          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded text-white bg-[#9333EA]">CAPTAÇÃO MEIO</span>
              <span className="text-[12px] text-notion-text-secondary">Webinar, Comunidade, Simulador Financeiro</span>
            </div>
            <div className="rounded-lg border border-[#DDD6FE] overflow-hidden">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[#F5F3FF] border-b border-[#DDD6FE]">
                    <th className="px-4 py-2 text-left text-[11px] font-semibold text-[#9333EA] uppercase tracking-wider">URL</th>
                    <th className="px-4 py-2 text-left text-[11px] font-semibold text-[#9333EA] uppercase tracking-wider">Canal / Tipo</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { url: 'lp.behonest.com.br/', canal: 'Webinar' },
                    { url: 'lp.behonest.com.br/comunidade', canal: 'Grupo Empreenda / Comunidade' },
                    { url: 'lp.behonest.com.br/simulador-financeiro', canal: 'Simulador Financeiro' },
                  ].map((row) => (
                    <tr key={row.url} className="border-b border-[#DDD6FE] last:border-0 hover:bg-[#F5F3FF] transition-colors duration-[60ms]">
                      <td className="px-4 py-2"><code className="text-[12px] font-mono text-notion-text-primary">{row.url}</code></td>
                      <td className="px-4 py-2 text-[12px] text-notion-text-secondary">{row.canal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded text-white bg-[#0F7B6C]">CAPTAÇÃO FUNDO</span>
              <span className="text-[12px] text-notion-text-secondary">Landing pages de conversão direta</span>
            </div>
            <div className="rounded-lg border border-[#A7F3D0] overflow-hidden">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[#ECFDF5] border-b border-[#A7F3D0]">
                    <th className="px-4 py-2 text-left text-[11px] font-semibold text-[#0F7B6C] uppercase tracking-wider">URL</th>
                    <th className="px-4 py-2 text-left text-[11px] font-semibold text-[#0F7B6C] uppercase tracking-wider">Canal / Origem</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { url: 'behonestbrasil.com.br/fazer-negocio-operador/', canal: 'LP Operador — Meta Ads' },
                    { url: 'behonestbrasil.com.br/fazer-negocio-operador-google', canal: 'LP Operador — Google Ads' },
                    { url: 'lp.behonest.com.br/meta', canal: 'LP Direta — Meta Ads' },
                    { url: 'lp.behonest.com.br/google', canal: 'LP Direta — Google Ads' },
                  ].map((row) => (
                    <tr key={row.url} className="border-b border-[#A7F3D0] last:border-0 hover:bg-[#ECFDF5] transition-colors duration-[60ms]">
                      <td className="px-4 py-2"><code className="text-[12px] font-mono text-notion-text-primary">{row.url}</code></td>
                      <td className="px-4 py-2 text-[12px] text-notion-text-secondary">{row.canal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded text-white bg-[#D97706]">ESPECIAL</span>
              <span className="text-[12px] text-notion-text-secondary">Captação de eventos e ações específicas</span>
            </div>
            <div className="rounded-lg border border-[#FDE68A] overflow-hidden">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[#FFFBEB] border-b border-[#FDE68A]">
                    <th className="px-4 py-2 text-left text-[11px] font-semibold text-[#D97706] uppercase tracking-wider">URL</th>
                    <th className="px-4 py-2 text-left text-[11px] font-semibold text-[#D97706] uppercase tracking-wider">Finalidade</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { url: 'lp.behonest.com.br/operacao-behonest', desc: 'Cadastro para evento presencial Be Honest' },
                    { url: 'lp.behonest.com.br/aulao-grupo', desc: 'Cadastro no aulão semanal — exclusivo membros do Grupo Comunidade' },
                  ].map((row) => (
                    <tr key={row.url} className="border-b border-[#FDE68A] last:border-0 hover:bg-[#FFFBEB] transition-colors duration-[60ms]">
                      <td className="px-4 py-2"><code className="text-[12px] font-mono text-notion-text-primary">{row.url}</code></td>
                      <td className="px-4 py-2 text-[12px] text-notion-text-secondary">{row.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── REGRAS DE ID ─────────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Hash size={15} className="text-notion-primary" />
            <h2 className="text-base font-semibold text-notion-text-primary">Regras de ID</h2>
          </div>
          <div className="bg-notion-bg-primary rounded-lg shadow-notion-md p-5 space-y-3">
            <p className="text-[13px] text-notion-text-secondary leading-relaxed">
              O <strong>ID Lead</strong> é atribuído por <strong>e-mail</strong> — identifica a pessoa, não a conversão.
              O mesmo lead pode aparecer múltiplas vezes no CRM (uma linha por conversão), todas com o mesmo ID.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-[#ECFDF5] border border-[#A7F3D0] rounded p-3">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#0F7B6C] mb-1.5">Comportamento esperado</p>
                <ul className="space-y-1">
                  {[
                    'Mesmo email = mesmo ID em todas as linhas',
                    'Conversões distintas = linhas separadas com o mesmo ID',
                    '2 conversões no mesmo dia = 2 registros com o mesmo ID',
                    'Reconversões rastreadas pela contagem de linhas por ID',
                  ].map((t, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <CheckCircle size={11} className="text-[#0F7B6C] flex-shrink-0 mt-0.5" />
                      <span className="text-[12px] text-notion-text-primary">{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-[#FFF5F5] border border-[#FECACA] rounded p-3">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#E03E3E] mb-1.5">Nunca fazer</p>
                <ul className="space-y-1">
                  {[
                    'Criar ID novo para o mesmo email',
                    'Mesclar linhas de conversões diferentes num único registro',
                    'Usar data como critério de unicidade',
                  ].map((t, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <XCircle size={11} className="text-[#E03E3E] flex-shrink-0 mt-0.5" />
                      <span className="text-[12px] text-notion-text-primary">{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ── EXCLUSÕES ────────────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Ban size={15} className="text-notion-primary" />
            <h2 className="text-base font-semibold text-notion-text-primary">Exclusões — Filtros de Qualidade</h2>
          </div>
          <div className="bg-notion-bg-primary rounded-lg shadow-notion-md p-5 space-y-3">
            <p className="text-[13px] text-notion-text-secondary leading-relaxed">
              Os leads abaixo são automaticamente excluídos do CRM durante a sincronização e não aparecem
              em nenhuma contagem, tabela ou relatório.
            </p>
            <div className="space-y-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-notion-text-tertiary mb-2">Pessoas excluídas (por nome ou email)</p>
                <div className="flex flex-wrap gap-2">
                  {['Francisco Possato', 'Carlos Fernandes', 'João Gabriel dos Santos dos Anjos'].map((name) => (
                    <span key={name} className="inline-flex items-center gap-1.5 text-[12px] font-medium px-2.5 py-1 rounded-full bg-[#FFF5F5] border border-[#FECACA] text-[#E03E3E]">
                      <XCircle size={11} />
                      {name}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-notion-text-tertiary mb-2">Entradas de teste</p>
                <p className="text-[12px] text-notion-text-secondary">Qualquer lead cujo nome ou email contenha <code className="font-mono bg-notion-bg-secondary border border-notion-border px-1 rounded">teste</code>, <code className="font-mono bg-notion-bg-secondary border border-notion-border px-1 rounded">test</code> ou <code className="font-mono bg-notion-bg-secondary border border-notion-border px-1 rounded">@test</code> (comparação case-insensitive) é descartado.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── SINCRONIZAÇÃO DO CRM ─────────────────────────────── */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <GitMerge size={15} className="text-notion-primary" />
            <h2 className="text-base font-semibold text-notion-text-primary">Sincronização do CRM</h2>
          </div>
          <div className="bg-notion-bg-primary rounded-lg shadow-notion-md p-5 space-y-4">
            <p className="text-[13px] text-notion-text-secondary leading-relaxed">
              O script <code className="font-mono bg-notion-bg-secondary border border-notion-border px-1 rounded text-[12px]">scripts/crm-sync.js</code> roda periodicamente e atualiza o CRM interno com novos leads provenientes de "Leads Be Honest". O resultado é salvo em duas fontes (Google Sheets + backend local).
            </p>
            <div className="space-y-2">
              {[
                { step: '1', title: 'Leitura da fonte', desc: 'Lê toda a aba "Leads Franquia" da planilha "Leads Be Honest" (todas as linhas desde 04/07/2025).', color: '#2383E2', bg: '#EBF4FF', border: '#BFDBFE' },
                { step: '2', title: 'Filtragem de qualidade', desc: 'Remove entradas de teste e os três nomes/emails da lista de exclusão.', color: '#E03E3E', bg: '#FFF5F5', border: '#FECACA' },
                { step: '3', title: 'Atribuição de ID', desc: 'Atribui ID por email — mesmo ID para mesma pessoa; múltiplas conversões = múltiplas linhas com o mesmo ID.', color: '#9333EA', bg: '#F5F3FF', border: '#DDD6FE' },
                { step: '4', title: 'Foco Captação', desc: 'Determina "CAPTAÇÃO MEIO", "CAPTAÇÃO FUNDO" ou "ESPECIAL" pela URL da página de conversão (ver seção "Páginas" acima).', color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
                { step: '5', title: 'Classificação de Estágio', desc: 'Aplica as regras de LEAD / PRÉ-MQL / MQL / MQL RECUSADO / LEAD PERDIDO (ver seção "Classificação de Leads" acima).', color: '#0F7B6C', bg: '#ECFDF5', border: '#A7F3D0' },
                { step: '6', title: 'Preservação dos dados comerciais', desc: 'Para leads já existentes, mantém os dados preenchidos pelo comercial (Status Pipeline, Motivo de perda, Valor). Esses campos nunca são sobrescritos pelo sync automático.', color: '#2383E2', bg: '#EBF4FF', border: '#BFDBFE' },
                { step: '7', title: 'Persistência dupla', desc: 'Escreve o resultado normalizado na aba "CRM_PAINEL" do [FRANQUIA]_Painel de Growth (Google Sheets) E no backend local do painel (para exibição rápida na interface).', color: '#0F7B6C', bg: '#ECFDF5', border: '#A7F3D0' },
              ].map((s) => (
                <div key={s.step} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-white text-[11px] font-bold mt-0.5" style={{ background: s.color }}>{s.step}</div>
                  <div className="flex-1 border rounded p-3" style={{ borderColor: s.border, background: s.bg }}>
                    <p className="text-[12px] font-semibold mb-0.5" style={{ color: s.color }}>{s.title}</p>
                    <p className="text-[12px] text-notion-text-secondary leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
