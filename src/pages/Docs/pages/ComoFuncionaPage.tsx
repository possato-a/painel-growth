import { GitMerge, Database, Globe, Zap, Server, TrendingUp } from 'lucide-react';
import { PageShell } from '../_components/PageShell';
import { Callout } from '../_components/Callout';
import { H2, H3 } from '../_components/H2';
import { NavCards } from '../_components/NavCards';

const TOC = [
  { id: 'visao-tecnica',   label: 'Visão técnica' },
  { id: 'meta-ads',        label: 'Integração Meta Ads' },
  { id: 'google-ads',      label: 'Integração Google Ads' },
  { id: 'crm-sheets',      label: 'CRM e Google Sheets' },
  { id: 'n8n',             label: 'Automações N8N' },
  { id: 'deploy',          label: 'Deploy e ambientes' },
];

export function ComoFuncionaPage() {
  return (
    <PageShell
      badge="Getting started"
      title="Como o painel funciona"
      description="Visão técnica completa da arquitetura — backend Express, integrações de API, fluxo de dados CRM e estratégia de deploy no Vercel."
      toc={TOC}
    >
      <H2 id="visao-tecnica" icon={<Server size={15} />}>Visão técnica</H2>

      <p className="text-[14px] text-notion-text-secondary leading-relaxed mb-4">
        O painel é uma aplicação full-stack com frontend React e backend Express rodando na mesma
        instância Vercel. O frontend consome uma API REST interna que agrega dados do Meta Ads e do
        Google Sheets.
      </p>

      <div className="rounded-lg border border-notion-border bg-notion-bg-secondary p-5 mb-6 font-mono text-[12px] text-notion-text-secondary leading-loose">
        <p className="text-notion-text-tertiary mb-2"># Portas em desenvolvimento local</p>
        <p><span className="text-[#2383E2]">Frontend</span>  (Vite)    → localhost:<span className="text-[#0F7B6C]">5173</span></p>
        <p><span className="text-[#D97706]">Backend</span>   (Express) → localhost:<span className="text-[#0F7B6C]">3001</span></p>
        <p className="text-notion-text-tertiary mt-2"># Proxy configurado no vite.config.ts</p>
        <p>/api/*  → <span className="text-[#D97706]">http://localhost:3001</span></p>
      </div>

      <H3>Estrutura de pastas</H3>

      <div className="rounded-lg border border-notion-border bg-notion-bg-secondary p-4 font-mono text-[12px] text-notion-text-secondary leading-loose mb-6">
        <p className="text-notion-text-tertiary"># Diretórios principais</p>
        <p><span className="text-[#2383E2]">src/</span>          React app (TypeScript)</p>
        <p><span className="text-[#D97706]">server/</span>       Express backend (ESM)</p>
        <p><span className="text-[#9333EA]">scripts/</span>      Utilitários Node.js / Python</p>
        <p><span className="text-[#0F7B6C]">automações-n8n/</span>  Workflows exportados do N8N</p>
      </div>

      <H2 id="meta-ads" icon={<Globe size={15} />}>Integração Meta Ads</H2>

      <p className="text-[14px] text-notion-text-secondary leading-relaxed mb-4">
        O backend consulta a <strong>Meta Graph API v19.0</strong> autenticado com um access token de
        longa duração. Um token manager cuida do refresh automático antes de cada requisição.
      </p>

      <div className="overflow-x-auto rounded-lg border border-notion-border mb-5">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-notion-bg-secondary border-b border-notion-border">
              {['Endpoint', 'Descrição', 'Parâmetros'].map((h) => (
                <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold text-notion-text-secondary uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { ep: '/api/meta/overview',             desc: 'Insights de conta',                params: 'date_preset | since+until' },
              { ep: '/api/meta/campaigns',            desc: 'Lista de campanhas + insights',     params: 'date_preset | since+until' },
              { ep: '/api/meta/campaigns/:id/adsets', desc: 'Conjuntos de uma campanha',         params: 'date_preset | since+until' },
              { ep: '/api/meta/adsets/:id/ads',       desc: 'Anúncios de um conjunto',           params: 'date_preset | since+until' },
              { ep: '/api/meta/adsets-all',           desc: 'Todos os conjuntos da conta',       params: 'date_preset | since+until' },
              { ep: '/api/meta/ads',                  desc: 'Todos os anúncios da conta',        params: 'date_preset | since+until' },
            ].map((row) => (
              <tr key={row.ep} className="border-b border-notion-border last:border-0 hover:bg-notion-bg-secondary/50 transition-colors">
                <td className="px-4 py-2.5">
                  <code className="font-mono text-[11px] text-[#2383E2] bg-[#EBF4FF] px-1.5 py-0.5 rounded">
                    {row.ep}
                  </code>
                </td>
                <td className="px-4 py-2.5 text-[13px] text-notion-text-secondary">{row.desc}</td>
                <td className="px-4 py-2.5 text-[12px] font-mono text-notion-text-tertiary">{row.params}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Callout type="note" title="Métricas retornadas">
        Cada insight inclui: <code className="font-mono text-[12px]">impressions</code>,{' '}
        <code className="font-mono text-[12px]">clicks</code>,{' '}
        <code className="font-mono text-[12px]">spend</code>,{' '}
        <code className="font-mono text-[12px]">reach</code>,{' '}
        <code className="font-mono text-[12px]">cpm</code>,{' '}
        <code className="font-mono text-[12px]">cpc</code>,{' '}
        <code className="font-mono text-[12px]">ctr</code>.
      </Callout>

      <H2 id="google-ads" icon={<TrendingUp size={15} />}>Integração Google Ads</H2>

      <p className="text-[14px] text-notion-text-secondary leading-relaxed mb-4">
        O backend consulta a <strong>Google Ads API v20</strong> via REST/GAQL autenticado com OAuth 2.0.
        A conta configurada é uma <strong>Conta Gerente (MCC)</strong> — os clientes sub-conta são descobertos
        automaticamente e consultados em paralelo.
      </p>

      <Callout type="note" title="Conta Gerente (MCC)">
        O MCC <code className="font-mono text-[12px]">238-084-0433</code> é o ponto de entrada. Os
        sub-clientes (ex.: <code className="font-mono text-[12px]">717-140-7962</code>) são descobertos
        via <code className="font-mono text-[12px]">customer_client</code> GAQL e consultados com o
        header <code className="font-mono text-[12px]">login-customer-id</code> apontando para o MCC.
      </Callout>

      <div className="overflow-x-auto rounded-lg border border-notion-border mb-5 mt-4">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-notion-bg-secondary border-b border-notion-border">
              {['Endpoint', 'Descrição', 'Parâmetros'].map((h) => (
                <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold text-notion-text-secondary uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { ep: '/api/gads/ping',                       desc: 'Health check — valida token, lista sub-contas',    params: '—' },
              { ep: '/api/gads/overview',                   desc: 'Métricas agregadas de todas as sub-contas',        params: 'date_preset | since+until' },
              { ep: '/api/gads/campaigns',                  desc: 'Campanhas de todas as sub-contas (IDs compostos)', params: 'date_preset | since+until' },
              { ep: '/api/gads/campaigns/:id/adgroups',     desc: 'Grupos de anúncios de uma campanha',               params: 'date_preset | since+until' },
              { ep: '/api/gads/adgroups/:id/ads',           desc: 'Anúncios de um grupo',                             params: 'date_preset | since+until' },
            ].map((row) => (
              <tr key={row.ep} className="border-b border-notion-border last:border-0 hover:bg-notion-bg-secondary/50 transition-colors">
                <td className="px-4 py-2.5">
                  <code className="font-mono text-[11px] text-[#EA4335] bg-[#FEF2F2] px-1.5 py-0.5 rounded">
                    {row.ep}
                  </code>
                </td>
                <td className="px-4 py-2.5 text-[13px] text-notion-text-secondary">{row.desc}</td>
                <td className="px-4 py-2.5 text-[12px] font-mono text-notion-text-tertiary">{row.params}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Callout type="tip" title="IDs compostos">
        Campanhas e grupos retornam IDs no formato{' '}
        <code className="font-mono text-[12px]">{'{clientId}:{resourceId}'}</code> (ex.:{' '}
        <code className="font-mono text-[12px]">7171407962:23513685510</code>) para suportar múltiplas
        sub-contas MCC sem colisão de IDs.
      </Callout>

      <H2 id="crm-sheets" icon={<Database size={15} />}>CRM e Google Sheets</H2>

      <p className="text-[14px] text-notion-text-secondary leading-relaxed mb-4">
        O CRM usa o Google Sheets como fonte de dados primária. O backend lê e escreve nas planilhas
        via <strong>Google Sheets API v4</strong> com autenticação OAuth 2.0.
      </p>

      <div className="space-y-3 mb-5">
        {[
          {
            ep: '/api/crm/leads',
            method: 'GET',
            desc: 'Retorna todos os leads do CRM (cache de 5 min)',
            color: '#0F7B6C',
          },
          {
            ep: '/api/crm/history',
            method: 'GET',
            desc: 'Retorna o histórico completo de leads',
            color: '#0F7B6C',
          },
          {
            ep: '/api/crm/leads/:rowId',
            method: 'PATCH',
            desc: 'Atualiza estágio / status / motivo de perda de um lead',
            color: '#D97706',
          },
          {
            ep: '/api/crm/sync',
            method: 'POST',
            desc: 'Dispara sincronização completa da fonte primária',
            color: '#9333EA',
          },
        ].map((row) => (
          <div key={row.ep} className="flex items-center gap-3 p-3 rounded-lg border border-notion-border bg-notion-bg-secondary">
            <span
              className="text-[11px] font-bold font-mono px-2 py-0.5 rounded flex-shrink-0"
              style={{ color: row.color, background: `${row.color}18` }}
            >
              {row.method}
            </span>
            <code className="text-[12px] font-mono text-notion-text-primary flex-shrink-0">{row.ep}</code>
            <span className="text-[12px] text-notion-text-tertiary ml-auto text-right">{row.desc}</span>
          </div>
        ))}
      </div>

      <H2 id="n8n" icon={<Zap size={15} />}>Automações N8N</H2>

      <p className="text-[14px] text-notion-text-secondary leading-relaxed mb-4">
        O N8N roda em paralelo ao painel e gerencia a captura de leads das landing pages. Os workflows
        exportados estão na pasta <code className="font-mono text-[12px]">automações-n8n/</code>.
      </p>

      <div className="space-y-2 mb-5">
        {[
          { file: '[GROWTH] Consolidação CRM - BASE.json',        desc: 'Workflow principal — normaliza e deduplica leads antes de gravar no Sheets' },
          { file: '[GROWTH] LP Operação - Webhook Sheets.json',   desc: 'Webhook disparado pelos formulários das landing pages' },
          { file: '[GROWTH][META][NUTRICAO].json',                desc: 'Tracking de nutrição integrado ao Meta Ads' },
          { file: '[SUB] Backup Franquia Antigo.json',            desc: 'Backup legado para migração de dados históricos' },
        ].map((item) => (
          <div key={item.file} className="flex items-start gap-3 p-3 rounded-lg border border-notion-border">
            <code className="text-[11px] font-mono text-notion-text-secondary bg-notion-bg-secondary px-2 py-0.5 rounded flex-shrink-0 mt-0.5">
              {item.file}
            </code>
            <span className="text-[12px] text-notion-text-secondary leading-snug">{item.desc}</span>
          </div>
        ))}
      </div>

      <H2 id="deploy" icon={<Server size={15} />}>Deploy e ambientes</H2>

      <p className="text-[14px] text-notion-text-secondary leading-relaxed mb-4">
        O painel é deployado no <strong>Vercel</strong> com frontend e backend na mesma instância.
        O sistema de arquivos do Vercel é read-only, então o backend usa <code className="font-mono text-[12px]">/tmp</code>{' '}
        para gravações temporárias e lê dados iniciais de <code className="font-mono text-[12px]">crm-data.json</code>.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
        {[
          { env: 'Desenvolvimento', cmd: 'npm run dev', note: 'Inicia Vite (5173) + Express (3001) simultaneamente' },
          { env: 'Build',           cmd: 'npm run build', note: 'tsc + vite build → dist/' },
          { env: 'Produção',        cmd: 'vercel --prod', note: 'Deploy automático pelo CLI do Vercel' },
        ].map((row) => (
          <div key={row.env} className="rounded-lg border border-notion-border p-3 bg-notion-bg-secondary">
            <p className="text-[11px] font-bold uppercase tracking-widest text-notion-text-tertiary mb-1">{row.env}</p>
            <code className="text-[13px] font-mono text-notion-text-primary">{row.cmd}</code>
            <p className="text-[12px] text-notion-text-tertiary mt-1">{row.note}</p>
          </div>
        ))}
      </div>

      <Callout type="warning" title="Variáveis de ambiente">
        Em produção, configure todas as variáveis no painel do Vercel:{' '}
        <code className="font-mono text-[12px]">META_ACCESS_TOKEN</code>,{' '}
        <code className="font-mono text-[12px]">GOOGLE_CLIENT_ID</code>,{' '}
        <code className="font-mono text-[12px]">GOOGLE_CLIENT_SECRET</code>,{' '}
        <code className="font-mono text-[12px]">GOOGLE_REFRESH_TOKEN</code>,{' '}
        <code className="font-mono text-[12px]">GOOGLE_ADS_DEVELOPER_TOKEN</code> e{' '}
        <code className="font-mono text-[12px]">GOOGLE_ADS_CUSTOMER_ID</code> (ID do MCC). Nunca commite o <code className="font-mono text-[12px]">.env</code> no repositório.
      </Callout>

      <NavCards
        cards={[
          { title: 'Classificação de Leads', description: 'Regras de estágio do CRM e como os leads são classificados automaticamente.',  to: '/docs/classificacao-leads' },
          { title: 'Fontes de Dados',         description: 'Quais planilhas alimentam o painel e o significado de cada coluna.',           to: '/docs/fontes-dados'        },
        ]}
      />
    </PageShell>
  );
}
