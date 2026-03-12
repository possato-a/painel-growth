import { BarChart2, Database, Zap, Users, GitMerge, Globe, TrendingUp } from 'lucide-react';
import { PageShell } from '../_components/PageShell';
import { Callout } from '../_components/Callout';
import { NavCards } from '../_components/NavCards';
import { H2, H3 } from '../_components/H2';

const TOC = [
  { id: 'o-que-e',     label: 'O que é o Painel Growth' },
  { id: 'modulos',     label: 'Módulos principais' },
  { id: 'fluxo',       label: 'Fluxo de dados' },
  { id: 'proximos',    label: 'Próximos passos' },
];

export function OverviewPage() {
  return (
    <PageShell
      badge="Getting started"
      title="Visão Geral"
      description="O Painel Growth é a central de operações de marketing e CRM da Be Honest Franquia — integra Meta Ads, Google Sheets e leads em uma interface unificada."
      toc={TOC}
    >
      <H2 id="o-que-e" icon={<BarChart2 size={15} />}>O que é o Painel Growth</H2>

      <p className="text-[14px] text-notion-text-secondary leading-relaxed mb-4">
        O Painel Growth centraliza dados de três fontes distintas — Meta Ads, planilhas Google e o
        pipeline comercial — e os exibe em um único dashboard para o time de marketing e vendas da Be
        Honest Franquia.
      </p>

      <p className="text-[14px] text-notion-text-secondary leading-relaxed mb-4">
        O painel é dividido em três eixos principais:
      </p>

      <ul className="space-y-2 mb-6">
        {[
          { label: 'Meta Ads',    desc: 'Visualização de campanhas, conjuntos e anúncios com métricas de performance (CTR, CPC, CPM, spend) filtráveis por período.' },
          { label: 'Google Ads', desc: 'Integração com a Google Ads API v20 via conta gerente (MCC). Exibe campanhas, grupos de anúncios e anúncios de todas as sub-contas.' },
          { label: 'CRM',        desc: 'Gestão de leads com classificação automática por estágio, sincronização com Google Sheets e histórico de conversões.' },
        ].map((item) => (
          <li key={item.label} className="flex items-start gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-notion-primary flex-shrink-0 mt-2" />
            <p className="text-[14px] text-notion-text-secondary leading-relaxed">
              <strong className="text-notion-text-primary">{item.label}</strong> — {item.desc}
            </p>
          </li>
        ))}
      </ul>

      <Callout type="tip" title="Deploy">
        O painel está disponível em produção em{' '}
        <strong>painel-growth.vercel.app</strong>. O backend roda na mesma instância Vercel com
        suporte a ambientes read-only (armazenamento em <code className="font-mono text-[12px]">/tmp</code>).
      </Callout>

      <H2 id="modulos" icon={<Database size={15} />}>Módulos principais</H2>

      <div className="space-y-3 mb-6">
        {[
          {
            icon: <BarChart2 size={14} />,
            color: '#2383E2',
            bg: '#EBF4FF',
            border: '#BFDBFE',
            title: 'Meta Ads',
            path: '/meta-ads/geral',
            desc: 'Dashboard de performance com drill-down Conta → Campanhas → Conjuntos → Anúncios. Suporta presets de data e intervalos customizados.',
            features: ['Visão geral da conta', 'Performance por funil', 'Criativos', 'Meio de funil'],
          },
          {
            icon: <TrendingUp size={14} />,
            color: '#EA4335',
            bg: '#FEF2F2',
            border: '#FECACA',
            title: 'Google Ads',
            path: '/google-ads',
            desc: 'Dashboard de campanhas Google via API v20 com suporte a conta gerente (MCC). Drill-down Conta → Campanhas → Grupos → Anúncios com métricas GAQL.',
            features: ['MCC multi-conta', 'Campanhas & grupos', 'GAQL v20', 'Métricas normalizadas'],
          },
          {
            icon: <Users size={14} />,
            color: '#0F7B6C',
            bg: '#ECFDF5',
            border: '#A7F3D0',
            title: 'CRM',
            path: '/crm',
            desc: 'Tabela de leads com classificação automática de estágio, edição inline do pipeline comercial e sincronização bidirecional com Google Sheets.',
            features: ['Classificação automática', 'Pipeline comercial', 'Histórico de leads', 'Sync com Sheets'],
          },
          {
            icon: <Globe size={14} />,
            color: '#9333EA',
            bg: '#F5F3FF',
            border: '#DDD6FE',
            title: 'Documentação',
            path: '/docs/overview',
            desc: 'Referência completa das regras de negócio, fontes de dados, classificação de leads e lógica de sincronização.',
            features: ['Regras de CRM', 'Fontes de dados', 'Cidades de operação', 'API interna'],
          },
        ].map((mod) => (
          <div
            key={mod.title}
            className="rounded-lg border border-notion-border overflow-hidden"
            style={{ borderLeftColor: mod.color, borderLeftWidth: '3px' }}
          >
            <div className="px-4 py-3 bg-notion-bg-secondary border-b border-notion-border flex items-center gap-2">
              <span style={{ color: mod.color }}>{mod.icon}</span>
              <span className="text-[13px] font-semibold" style={{ color: mod.color }}>{mod.title}</span>
            </div>
            <div className="px-4 py-3 bg-notion-bg-primary">
              <p className="text-[13px] text-notion-text-secondary leading-relaxed mb-2">{mod.desc}</p>
              <div className="flex flex-wrap gap-1.5">
                {mod.features.map((f) => (
                  <span
                    key={f}
                    className="text-[11px] px-2 py-0.5 rounded border"
                    style={{ color: mod.color, background: mod.bg, borderColor: mod.border }}
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <H2 id="fluxo" icon={<GitMerge size={15} />}>Fluxo de dados</H2>

      <p className="text-[14px] text-notion-text-secondary leading-relaxed mb-5">
        Os dados fluem de três fontes externas para o backend Express, que os serve ao frontend React.
        O CRM tem uma camada de cache local para exibição rápida na interface.
      </p>

      <div className="rounded-lg border border-notion-border overflow-hidden mb-6">
        <div className="px-4 py-2.5 bg-notion-bg-secondary border-b border-notion-border">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-notion-text-tertiary">
            Arquitetura simplificada
          </p>
        </div>
        <div className="px-4 py-5 bg-notion-bg-primary space-y-4">
          {[
            { from: 'Meta Ads API (v19)',        arrow: '→', to: 'Express /api/meta/*',    color: '#2383E2' },
            { from: 'Google Ads API (v20/MCC)', arrow: '→', to: 'Express /api/gads/*',    color: '#EA4335' },
            { from: 'Google Sheets API',        arrow: '→', to: 'Express /api/crm/*',     color: '#0F7B6C' },
            { from: 'N8N Webhooks',             arrow: '→', to: 'Google Sheets (fonte)',  color: '#9333EA' },
            { from: 'Express backend',          arrow: '→', to: 'React Frontend (Vite)', color: '#D97706' },
          ].map((row) => (
            <div key={row.from} className="flex items-center gap-3 text-[13px]">
              <span
                className="font-mono text-[12px] px-2.5 py-1 rounded border flex-shrink-0"
                style={{ color: row.color, background: `${row.color}12`, borderColor: `${row.color}40` }}
              >
                {row.from}
              </span>
              <span className="text-notion-text-tertiary flex-shrink-0">{row.arrow}</span>
              <span className="text-[13px] text-notion-text-secondary">{row.to}</span>
            </div>
          ))}
        </div>
      </div>

      <H3>Stack técnica</H3>

      <div className="overflow-x-auto rounded-lg border border-notion-border mb-6">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-notion-bg-secondary border-b border-notion-border">
              {['Camada', 'Tecnologia', 'Versão'].map((h) => (
                <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold text-notion-text-secondary uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { camada: 'Frontend', tech: 'React + TypeScript + Vite', version: '18.3 / 5.5 / 5.4' },
              { camada: 'Estilo',   tech: 'Tailwind CSS',               version: '3.4' },
              { camada: 'Backend',  tech: 'Express (Node.js, ESM)',      version: '4.21' },
              { camada: 'Deploy',   tech: 'Vercel',                      version: 'latest' },
              { camada: 'Ads API',  tech: 'Meta Graph API',              version: 'v19.0' },
              { camada: 'Ads API', tech: 'Google Ads API (REST/GAQL)',  version: 'v20' },
              { camada: 'Dados',   tech: 'Google Sheets API',           version: 'v4' },
            ].map((row) => (
              <tr key={row.camada} className="border-b border-notion-border last:border-0 hover:bg-notion-bg-secondary/50 transition-colors">
                <td className="px-4 py-2.5 text-[13px] font-medium text-notion-text-primary">{row.camada}</td>
                <td className="px-4 py-2.5 text-[13px] text-notion-text-secondary">{row.tech}</td>
                <td className="px-4 py-2.5 text-[12px] font-mono text-notion-text-tertiary">{row.version}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <H2 id="proximos" icon={<Zap size={15} />}>Próximos passos</H2>

      <NavCards
        label="Explore a documentação"
        cards={[
          { title: 'Como o painel funciona',  description: 'Entenda a arquitetura completa e o fluxo de dados end-to-end.',          to: '/docs/como-funciona'        },
          { title: 'Classificação de Leads',  description: 'Regras de estágio: LEAD, PRÉ-MQL, MQL, MQL RECUSADO e LEAD PERDIDO.',    to: '/docs/classificacao-leads'  },
          { title: 'Sincronização do CRM',    description: 'Como o script de sync funciona e o que cada etapa processa.',            to: '/docs/sincronizacao'        },
          { title: 'Fontes de Dados',         description: 'Quais planilhas alimentam o painel e o que cada coluna significa.',      to: '/docs/fontes-dados'         },
        ]}
      />
    </PageShell>
  );
}
