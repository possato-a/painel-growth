import { CheckCircle, XCircle, ArrowRight, Hash } from 'lucide-react';
import { PageShell } from '../_components/PageShell';
import { Callout } from '../_components/Callout';
import { NavCards } from '../_components/NavCards';
import { H2 } from '../_components/H2';

const TOC = [
  { id: 'fluxo',   label: 'Fluxo de classificação' },
  { id: 'estagios', label: 'Estágios de lead' },
  { id: 'resumo',  label: 'Resumo comparativo' },
];

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
    description: 'Lead que completou os três critérios: está na praça, tem capital e fez a levantada de mão — pediu ativamente para conversar com o time comercial. Pode chegar via evolução de Pré-MQL ou diretamente do fundo de funil.',
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

function StageCard({ stage }: { stage: Stage }) {
  return (
    <div
      className="rounded-lg border border-notion-border overflow-hidden"
      style={{ borderLeftColor: stage.color, borderLeftWidth: '3px' }}
    >
      <div className="px-4 py-3 flex items-center gap-3 bg-notion-bg-secondary border-b border-notion-border">
        <span className="text-xl flex-shrink-0">{stage.icon}</span>
        <div className="min-w-0">
          <span className="text-[11px] font-bold tracking-widest uppercase px-2 py-0.5 rounded text-white" style={{ background: stage.color }}>
            {stage.label}
          </span>
          <p className="text-[12px] font-medium mt-0.5" style={{ color: stage.color }}>{stage.tagline}</p>
        </div>
      </div>
      <div className="px-4 py-4 bg-notion-bg-primary space-y-4">
        <p className="text-[13px] text-notion-text-secondary leading-relaxed">{stage.description}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-notion-text-tertiary mb-2">Critérios</p>
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
            <p className="text-[10px] font-bold uppercase tracking-widest text-notion-text-tertiary mb-2">Dados capturados</p>
            <ul className="space-y-1.5">
              {stage.dataRequired.map((d, i) => (
                <li key={i} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5" style={{ background: stage.color }} />
                  <span className="text-[12px] text-notion-text-primary leading-snug">{d}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        {stage.note && (
          <Callout type="info">{stage.note}</Callout>
        )}
      </div>
    </div>
  );
}

export function ClassificacaoLeadsPage() {
  return (
    <PageShell
      badge="CRM Conceitos"
      title="Classificação de Leads"
      description="Define os estágios pelos quais um lead passa desde o primeiro contato até a qualificação comercial — determina a régua de comunicação e os critérios de descarte."
      toc={TOC}
    >
      <H2 id="fluxo" icon={<ArrowRight size={15} />}>Fluxo de classificação</H2>

      <p className="text-[14px] text-notion-text-secondary leading-relaxed mb-5">
        O fluxo principal é linear — um lead entra como <strong>LEAD</strong> e pode evoluir até{' '}
        <strong>MQL</strong>. Existem duas saídas possíveis para leads que não atendem os critérios.
      </p>

      <div className="bg-notion-bg-secondary rounded-lg border border-notion-border p-5 space-y-4 mb-6">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-notion-text-tertiary mb-3">Fluxo principal</p>
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { label: 'LEAD', color: '#2383E2', icon: '📋' },
              { label: 'PRÉ-MQL', color: '#9333EA', icon: '🔍' },
              { label: 'MQL', color: '#0F7B6C', icon: '🙋' },
            ].map((s, i, arr) => (
              <>
                <div key={s.label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-[12px] font-semibold" style={{ background: s.color }}>
                  <span>{s.icon}</span>
                  <span>{s.label}</span>
                </div>
                {i < arr.length - 1 && <ArrowRight size={14} className="text-notion-text-tertiary flex-shrink-0" />}
              </>
            ))}
          </div>
        </div>
        <div className="pt-3 border-t border-notion-border">
          <p className="text-[10px] font-bold uppercase tracking-widest text-notion-text-tertiary mb-2">Saídas do funil</p>
          <div className="flex flex-wrap gap-4">
            {[
              { label: 'MQL RECUSADO', color: '#D97706', icon: '⛔', from: 'fundo de funil' },
              { label: 'LEAD PERDIDO', color: '#E03E3E', icon: '📍', from: 'meio de funil' },
            ].map((e) => (
              <div key={e.label} className="flex items-center gap-1.5">
                <XCircle size={12} style={{ color: e.color }} />
                <span className="text-[12px] font-medium px-2 py-0.5 rounded" style={{ background: `${e.color}18`, color: e.color }}>
                  {e.icon} {e.label}
                </span>
                <span className="text-[11px] text-notion-text-tertiary">via {e.from}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <H2 id="estagios" icon={<CheckCircle size={15} />}>Estágios de lead</H2>

      <p className="text-[14px] text-notion-text-secondary leading-relaxed mb-5">
        Cada estágio tem critérios objetivos que determinam quando um lead entra nele, quais dados são
        necessários e o que o sistema espera do time comercial.
      </p>

      <div className="space-y-4 mb-6">
        {STAGES.map((stage) => (
          <StageCard key={stage.label} stage={stage} />
        ))}
      </div>

      <H2 id="resumo" icon={<Hash size={15} />}>Resumo comparativo</H2>

      <p className="text-[14px] text-notion-text-secondary leading-relaxed mb-4">
        Tabela de referência rápida para identificar o estágio de um lead pelos três critérios fundamentais.
      </p>

      <div className="rounded-lg border border-notion-border overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[520px]">
            <thead>
              <tr className="bg-notion-bg-secondary border-b border-notion-border">
                {['Estágio', 'Origem', 'Na praça?', 'Tem capital?', 'Pediu conversa?'].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold text-notion-text-secondary uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { label: 'LEAD',         color: '#2383E2', origem: 'Meio de funil',          praca: '?', capital: '?', pediu: '—' },
                { label: 'PRÉ-MQL',      color: '#9333EA', origem: 'Meio de funil',          praca: '✓', capital: '✓', pediu: '—' },
                { label: 'MQL',          color: '#0F7B6C', origem: 'Meio ou fundo de funil', praca: '✓', capital: '✓', pediu: '✓' },
                { label: 'MQL RECUSADO', color: '#D97706', origem: 'Fundo de funil',         praca: '✗', capital: '✗', pediu: '✓' },
                { label: 'LEAD PERDIDO', color: '#E03E3E', origem: 'Meio de funil',          praca: '✗', capital: '?', pediu: '—' },
              ].map((row) => (
                <tr key={row.label} className="border-b border-notion-border last:border-0 hover:bg-notion-bg-secondary/50 transition-colors">
                  <td className="px-4 py-2.5">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded" style={{ background: `${row.color}18`, color: row.color }}>
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

      <NavCards
        cards={[
          { title: 'Auto-Evolução de Estágio', description: 'Como o sistema avança estágios automaticamente a cada sincronização.',  to: '/docs/auto-evolucao'  },
          { title: 'Sincronização do CRM',     description: 'As 7 etapas do script de sync e o que acontece em cada uma.',          to: '/docs/sincronizacao'  },
        ]}
      />
    </PageShell>
  );
}
