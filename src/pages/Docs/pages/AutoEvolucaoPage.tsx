import { Zap } from 'lucide-react';
import { PageShell } from '../_components/PageShell';
import { Callout } from '../_components/Callout';
import { NavCards } from '../_components/NavCards';
import { H2, H3 } from '../_components/H2';

const TOC = [
  { id: 'como-funciona',   label: 'Como funciona' },
  { id: 'tres-criterios',  label: 'Três critérios' },
  { id: 'regras-meio',     label: 'Regras — Meio de Funil' },
  { id: 'regras-fundo',    label: 'Regras — Fundo de Funil' },
  { id: 'limites',         label: 'Limites da auto-evolução' },
];

export function AutoEvolucaoPage() {
  return (
    <PageShell
      badge="CRM Conceitos"
      title="Auto-Evolução de Estágio"
      description="Como o sistema avança automaticamente o estágio dos leads a cada sincronização, cruzando dados de todas as conversões de um mesmo email."
      toc={TOC}
    >
      <H2 id="como-funciona" icon={<Zap size={15} />}>Como funciona</H2>

      <p className="text-[14px] text-notion-text-secondary leading-relaxed mb-4">
        A cada execução do script de sincronização, o sistema agrupa todos os registros pelo campo{' '}
        <code className="font-mono text-[12px] bg-notion-bg-secondary border border-notion-border px-1.5 py-0.5 rounded">email</code>{' '}
        e avalia <strong>todas as conversões</strong> de um mesmo lead em conjunto — não apenas a mais recente.
      </p>

      <p className="text-[14px] text-notion-text-secondary leading-relaxed mb-5">
        Isso permite que o sistema detecte evoluções cross-conversão. Exemplo: um lead que converteu
        no Webinar (meio de funil) e depois clicou em uma LP de fundo de funil em outra campanha é
        automaticamente promovido para MQL na próxima sincronização.
      </p>

      <Callout type="tip" title="Cross-conversão">
        Um lead não precisa ter preenchido todos os critérios no mesmo formulário. O sistema agrupa{' '}
        <em>todas</em> as linhas com o mesmo email e faz uma OR lógico — se qualquer uma das conversões
        atende o critério, o critério é considerado satisfeito para aquele lead.
      </Callout>

      <H2 id="tres-criterios">Três critérios avaliados</H2>

      <p className="text-[14px] text-notion-text-secondary leading-relaxed mb-5">
        O estágio é determinado pela combinação de três sinais binários. Cada sinal é avaliado
        considerando todas as conversões do lead:
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        {[
          {
            label: 'Na Praça',
            icon: '📍',
            color: '#2383E2', bg: '#EBF4FF', border: '#BFDBFE',
            desc: 'Pelo menos uma conversão tem cidade dentro das praças de operação da Be Honest.',
            how: 'Campo Cidade comparado com a lista de cidades de operação.',
          },
          {
            label: 'Tem Capital',
            icon: '💰',
            color: '#9333EA', bg: '#F5F3FF', border: '#DDD6FE',
            desc: 'Pelo menos uma conversão indica disponibilidade de capital para investimento.',
            how: 'Campo "Disponibilidade de Investimento" com valor afirmativo.',
          },
          {
            label: 'Levantada de Mão',
            icon: '🙋',
            color: '#0F7B6C', bg: '#ECFDF5', border: '#A7F3D0',
            desc: 'Pelo menos uma conversão foi em uma página de fundo de funil (LP Operador ou LP Direta).',
            how: 'Campo Página mapeado como "CAPTAÇÃO FUNDO" na classificação de canal.',
          },
        ].map((c) => (
          <div key={c.label} className="rounded-lg border p-4" style={{ borderColor: c.border, background: c.bg }}>
            <span className="text-2xl">{c.icon}</span>
            <p className="text-[13px] font-bold mt-2" style={{ color: c.color }}>{c.label}</p>
            <p className="text-[12px] text-notion-text-secondary mt-1 leading-snug">{c.desc}</p>
            <p className="text-[11px] mt-2 font-medium" style={{ color: c.color }}>Como detectado: {c.how}</p>
          </div>
        ))}
      </div>

      <H2 id="regras-meio">Regras de evolução — Meio de Funil</H2>

      <p className="text-[14px] text-notion-text-secondary leading-relaxed mb-4">
        Para leads que converteram em canais de meio de funil (Webinar, Simulador, Comunidade),
        a tabela abaixo define o estágio resultante para cada combinação de critérios.
      </p>

      <div className="rounded-lg border border-notion-border overflow-hidden mb-6">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-notion-bg-secondary border-b border-notion-border">
              {['Na Praça', 'Capital', 'Levantou Mão', 'Resultado'].map((h) => (
                <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold text-notion-text-secondary uppercase tracking-wider">
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
              <tr key={i} className="border-b border-notion-border last:border-0 hover:bg-notion-bg-secondary/50 transition-colors">
                <td className="px-4 py-2.5 text-[13px]">{r.praca}</td>
                <td className="px-4 py-2.5 text-[13px]">{r.capital}</td>
                <td className="px-4 py-2.5 text-[13px]">{r.mao}</td>
                <td className="px-4 py-2.5">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded" style={{ color: r.rColor, background: `${r.rColor}18` }}>
                    {r.result}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <H2 id="regras-fundo">Regras de evolução — Fundo de Funil</H2>

      <p className="text-[14px] text-notion-text-secondary leading-relaxed mb-4">
        Para leads que converteram diretamente em landing pages de fundo de funil (LP Operador, LP
        Direta), a levantada de mão já é implícita — a avaliação usa apenas praça e capital.
      </p>

      <div className="rounded-lg border border-notion-border overflow-hidden mb-6">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-notion-bg-secondary border-b border-notion-border">
              {['Na Praça', 'Capital', 'Resultado'].map((h) => (
                <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold text-notion-text-secondary uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { praca: '✓',  capital: '✓',  result: 'MQL',          rColor: '#0F7B6C' },
              { praca: '✗',  capital: 'qualquer', result: 'MQL RECUSADO', rColor: '#D97706' },
              { praca: 'qualquer', capital: '✗', result: 'MQL RECUSADO', rColor: '#D97706' },
            ].map((r, i) => (
              <tr key={i} className="border-b border-notion-border last:border-0 hover:bg-notion-bg-secondary/50 transition-colors">
                <td className="px-4 py-2.5 text-[13px]">{r.praca}</td>
                <td className="px-4 py-2.5 text-[13px]">{r.capital}</td>
                <td className="px-4 py-2.5">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded" style={{ color: r.rColor, background: `${r.rColor}18` }}>
                    {r.result}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <H2 id="limites">Limites da auto-evolução</H2>

      <H3>O que o sistema faz automaticamente</H3>
      <ul className="space-y-2 mb-4">
        {[
          'Avança o estágio de LEAD → PRÉ-MQL → MQL conforme os critérios são atendidos',
          'Classifica novos leads como LEAD PERDIDO ou MQL RECUSADO quando não atendem os requisitos',
          'Aplica a lógica cross-conversão — cruzando todos os registros do mesmo email',
        ].map((t, i) => (
          <li key={i} className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#0F7B6C] flex-shrink-0 mt-2" />
            <span className="text-[14px] text-notion-text-secondary">{t}</span>
          </li>
        ))}
      </ul>

      <div className="space-y-2 mb-6">
        <Callout type="tip">
          Estágios <strong>nunca regridem</strong> automaticamente. Um lead que já é MQL não volta
          para PRÉ-MQL, mesmo que dados anteriores sejam corrigidos.
        </Callout>
        <Callout type="warning">
          Estágios comerciais — <strong>CONEXÃO, REUNIÃO FINANCEIRA, SQL</strong> etc. — nunca são
          sobrescritos pela auto-evolução. Esses estágios são definidos exclusivamente pelo time
          comercial na interface do CRM.
        </Callout>
      </div>

      <NavCards
        cards={[
          { title: 'Sincronização do CRM',     description: 'As 7 etapas do script de sync — quando e como a auto-evolução é aplicada.',  to: '/docs/sincronizacao'        },
          { title: 'Classificação de Leads',   description: 'Detalhes de cada estágio e os critérios completos.',                          to: '/docs/classificacao-leads'  },
          { title: 'Cidades de Operação',      description: 'A lista completa de cidades que classificam um lead como "na praça".',         to: '/docs/cidades'              },
        ]}
      />
    </PageShell>
  );
}
