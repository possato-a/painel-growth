import { BookOpen, CheckCircle, XCircle, MapPin, ArrowRight } from 'lucide-react';

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

      </div>
    </div>
  );
}
