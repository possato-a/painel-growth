import { GitMerge } from 'lucide-react';
import { PageShell } from '../_components/PageShell';
import { Callout } from '../_components/Callout';
import { NavCards } from '../_components/NavCards';
import { H2, H3 } from '../_components/H2';
import { Code } from '../_components/CodeBlock';

const TOC = [
  { id: 'visao-geral',  label: 'Visão geral' },
  { id: 'etapas',      label: '7 etapas do sync' },
  { id: 'persistencia', label: 'Persistência dupla' },
  { id: 'execucao',    label: 'Como executar' },
];

const SYNC_STEPS = [
  {
    step: '1',
    title: 'Leitura da fonte',
    color: '#2383E2',
    desc: 'Lê toda a aba "Leads Franquia" da planilha "Leads Be Honest" via Google Sheets API. Inclui todas as linhas desde 04/07/2025, independente do volume.',
  },
  {
    step: '2',
    title: 'Filtragem de qualidade',
    color: '#E03E3E',
    desc: 'Remove entradas de teste (nome/email contendo "teste", "test" ou "@test") e os três nomes/emails da lista de exclusão permanente.',
  },
  {
    step: '3',
    title: 'Atribuição de ID',
    color: '#9333EA',
    desc: 'Atribui ID por email — mesmo ID para a mesma pessoa. Múltiplas conversões geram múltiplas linhas com o mesmo ID. O ID é estável e determinístico.',
  },
  {
    step: '4',
    title: 'Classificação de Foco Captação',
    color: '#D97706',
    desc: 'Determina o campo "Foco Captação" como "CAPTAÇÃO MEIO", "CAPTAÇÃO FUNDO" ou "ESPECIAL" mapeando a URL da página de conversão para a categoria correspondente.',
  },
  {
    step: '5',
    title: 'Classificação de Estágio',
    color: '#0F7B6C',
    desc: 'Agrupa por email e aplica as regras cross-conversão para classificar como LEAD, PRÉ-MQL, MQL, MQL RECUSADO ou LEAD PERDIDO.',
  },
  {
    step: '6',
    title: 'Preservação de dados comerciais',
    color: '#2383E2',
    desc: 'Para leads já existentes na BASE_CRM, mantém os valores de Status Pipeline, Motivo de perda e Valor informados pelo time comercial. Esses campos nunca são sobrescritos.',
  },
  {
    step: '7',
    title: 'Persistência dupla',
    color: '#0F7B6C',
    desc: 'Escreve o resultado normalizado na aba "CRM_PAINEL" do [FRANQUIA]_Painel de Growth (Google Sheets) E no backend local (crm-data.json ou /tmp) para exibição rápida na interface.',
  },
];

export function SincronizacaoPage() {
  return (
    <PageShell
      badge="CRM Conceitos"
      title="Sincronização do CRM"
      description="Como o script crm-sync.js processa leads da fonte primária e grava os resultados em duas fontes — Google Sheets e backend local."
      toc={TOC}
    >
      <H2 id="visao-geral" icon={<GitMerge size={15} />}>Visão geral</H2>

      <p className="text-[14px] text-notion-text-secondary leading-relaxed mb-4">
        O script <Code>scripts/crm-sync.js</Code> é o motor do CRM. Ele lê os leads da fonte primária,
        aplica todas as regras de classificação e salva o resultado normalizado nas duas fontes de
        saída.
      </p>

      <p className="text-[14px] text-notion-text-secondary leading-relaxed mb-5">
        O sync pode ser disparado manualmente pelo endpoint <Code>/api/crm/sync</Code> ou executado
        diretamente via CLI. Ele é idempotente — rodar múltiplas vezes produz o mesmo resultado.
      </p>

      <Callout type="tip" title="Idempotência">
        O script pode ser executado quantas vezes forem necessárias sem risco de duplicações. Leads
        já existentes são atualizados (nunca duplicados) e dados comerciais são sempre preservados.
      </Callout>

      <H2 id="etapas">7 etapas do sync</H2>

      <p className="text-[14px] text-notion-text-secondary leading-relaxed mb-6">
        O processamento ocorre em sequência estrita. Cada etapa depende da anterior para garantir
        a integridade dos dados.
      </p>

      {/* Timeline */}
      <div className="mb-6">
        {SYNC_STEPS.map((s, i, arr) => (
          <div key={s.step} className="flex gap-4">
            {/* Circle + connecting line */}
            <div className="flex flex-col items-center flex-shrink-0">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[13px] font-bold z-10 flex-shrink-0"
                style={{ background: s.color }}
              >
                {s.step}
              </div>
              {i < arr.length - 1 && (
                <div
                  className="w-px flex-1 my-1"
                  style={{ background: `${s.color}35`, minHeight: '24px' }}
                />
              )}
            </div>

            {/* Content */}
            <div className="pb-6 flex-1 min-w-0 pt-1">
              <p className="text-[14px] font-semibold mb-0.5" style={{ color: s.color }}>
                {s.title}
              </p>
              <p className="text-[13px] text-notion-text-secondary leading-relaxed">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <H2 id="persistencia">Persistência dupla</H2>

      <p className="text-[14px] text-notion-text-secondary leading-relaxed mb-4">
        O resultado normalizado é gravado em dois destinos simultâneos. Essa estratégia garante
        tanto a durabilidade dos dados quanto a performance da interface.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {[
          {
            title: 'Google Sheets',
            icon: '📊',
            color: '#0F7B6C',
            bg: '#ECFDF5',
            border: '#A7F3D0',
            items: [
              'Planilha: [FRANQUIA]_Painel de Growth',
              'Aba: CRM_PAINEL',
              'Fonte da verdade compartilhada com o time',
              'Permite edição manual pelo time comercial',
            ],
          },
          {
            title: 'Backend local',
            icon: '💾',
            color: '#2383E2',
            bg: '#EBF4FF',
            border: '#BFDBFE',
            items: [
              'Arquivo: crm-data.json (dev) ou /tmp (Vercel)',
              'Cache para a interface do painel',
              'Retornado pelo endpoint /api/crm/leads',
              'TTL de 5 minutos no TanStack Query',
            ],
          },
        ].map((dest) => (
          <div key={dest.title} className="rounded-lg border overflow-hidden" style={{ borderColor: dest.border }}>
            <div className="px-4 py-2.5 border-b flex items-center gap-2" style={{ background: dest.bg, borderColor: dest.border }}>
              <span>{dest.icon}</span>
              <span className="text-[13px] font-semibold" style={{ color: dest.color }}>{dest.title}</span>
            </div>
            <ul className="px-4 py-3 space-y-1.5 bg-notion-bg-primary">
              {dest.items.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5" style={{ background: dest.color }} />
                  <span className="text-[12px] text-notion-text-secondary">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <H2 id="execucao">Como executar</H2>

      <H3>Via endpoint (interface)</H3>
      <p className="text-[14px] text-notion-text-secondary leading-relaxed mb-3">
        No painel, acesse a aba <strong>CRM</strong> e clique no botão de sincronização. Isso dispara
        uma chamada <Code>POST /api/crm/sync</Code> e atualiza a interface automaticamente.
      </p>

      <H3>Via CLI</H3>
      <div className="rounded-lg border border-notion-border overflow-hidden my-3">
        <div className="flex items-center justify-between px-4 py-2 bg-notion-bg-secondary border-b border-notion-border">
          <span className="text-[11px] font-mono text-notion-text-tertiary">shell</span>
        </div>
        <pre className="px-4 py-4 bg-[#1e1e2e] overflow-x-auto">
          <code className="text-[12.5px] font-mono text-[#cdd6f4] leading-relaxed">{`# No diretório raiz do projeto
node scripts/crm-sync.js`}</code>
        </pre>
      </div>

      <Callout type="note" title="Credenciais">
        O script precisa do arquivo <Code>scripts/google-token-store.json</Code> com o token OAuth
        válido. Em produção (Vercel), as credenciais são lidas das variáveis de ambiente.
      </Callout>

      <NavCards
        cards={[
          { title: 'Auto-Evolução',    description: 'Regras detalhadas de como os estágios são calculados na etapa 5.',       to: '/docs/auto-evolucao'   },
          { title: 'Exclusões',        description: 'Lista completa de filtros de qualidade aplicados na etapa 2.',            to: '/docs/exclusoes'       },
          { title: 'Fontes de Dados',  description: 'Estrutura das planilhas lidas na etapa 1 e escritas na etapa 7.',         to: '/docs/fontes-dados'    },
        ]}
      />
    </PageShell>
  );
}
