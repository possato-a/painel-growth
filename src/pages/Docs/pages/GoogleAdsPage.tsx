import { BarChart2, Key, Database, Zap, AlertTriangle, Server } from 'lucide-react';
import { PageShell } from '../_components/PageShell';
import { Callout } from '../_components/Callout';
import { H2, H3 } from '../_components/H2';
import { NavCards } from '../_components/NavCards';

const TOC = [
  { id: 'visao-geral',     label: 'Visão geral' },
  { id: 'autenticacao',    label: 'Autenticação OAuth + Developer Token' },
  { id: 'mcc',             label: 'Conta Gerente (MCC)' },
  { id: 'endpoints',       label: 'Endpoints da API interna' },
  { id: 'normalizacao',    label: 'Normalização de métricas' },
  { id: 'versoes',         label: 'Versões da API e migrações' },
  { id: 'variaveis',       label: 'Variáveis de ambiente' },
];

export function GoogleAdsPage() {
  return (
    <PageShell
      badge="Google Ads"
      title="Integração Google Ads"
      description="Como o painel se conecta à Google Ads API v20 via REST/GAQL — autenticação OAuth, suporte a MCC, normalização de métricas e hierarquia de dados."
      lastUpdated="mar/2026"
      toc={TOC}
    >
      <H2 id="visao-geral" icon={<BarChart2 size={15} />}>Visão geral</H2>

      <p className="text-[14px] text-notion-text-secondary leading-relaxed mb-4">
        O módulo Google Ads conecta à{' '}
        <strong>Google Ads API v20 (REST/GAQL)</strong> reutilizando o mesmo OAuth 2.0
        já configurado para o Google Sheets. O token é refreshado automaticamente antes de cada
        requisição pelo <code className="font-mono text-[12px]">getGoogleToken()</code> em{' '}
        <code className="font-mono text-[12px]">server/google-sheets.js</code>.
      </p>

      <p className="text-[14px] text-notion-text-secondary leading-relaxed mb-5">
        A conta <strong>238-084-0433</strong> é uma <strong>Conta Gerente (MCC)</strong>. Isso significa
        que ela não tem campanhas diretamente — as campanhas ficam nas sub-contas clientes. O backend
        descobre automaticamente os IDs das sub-contas via GAQL (<code className="font-mono text-[12px]">customer_client</code>)
        e agrega os dados de todas elas.
      </p>

      <div className="rounded-lg border border-notion-border bg-notion-bg-secondary p-5 mb-6 font-mono text-[12px] text-notion-text-secondary leading-loose">
        <p className="text-notion-text-tertiary mb-2"># Hierarquia de dados</p>
        <p><span className="text-[#2383E2]">MCC (238-084-0433)</span>  — Conta Gerente (login-customer-id)</p>
        <p className="pl-4"><span className="text-[#0F7B6C]">└── Client (717-140-7962)</span>  — Conta real com campanhas</p>
        <p className="pl-8 text-notion-text-tertiary">└── Campanhas → Grupos de Anúncios → Anúncios</p>
      </div>

      <H2 id="autenticacao" icon={<Key size={15} />}>Autenticação OAuth + Developer Token</H2>

      <p className="text-[14px] text-notion-text-secondary leading-relaxed mb-4">
        A Google Ads API exige dois mecanismos de autenticação em paralelo:
      </p>

      <div className="space-y-3 mb-5">
        {[
          {
            label: 'OAuth 2.0 Bearer Token',
            desc: 'Gerado a partir do GOOGLE_REFRESH_TOKEN via fluxo offline. Deve pertencer a um usuário com acesso à conta Google Ads (growth@behonestbrasil.com.br). Renovado automaticamente a cada chamada.',
            color: '#2383E2',
          },
          {
            label: 'Developer Token',
            desc: 'Identificador fixo da conta de desenvolvedor registrada no API Center do Google Ads (GOOGLE_ADS_DEVELOPER_TOKEN). Enviado em todas as requisições via header developer-token. Precisa ter status "Acesso Básico" aprovado.',
            color: '#D97706',
          },
          {
            label: 'login-customer-id',
            desc: 'Header obrigatório para contas gerentes. Deve conter o ID numérico do MCC (sem traços). Informa ao Google qual conta gerente está fazendo a requisição em nome de uma sub-conta.',
            color: '#9333EA',
          },
        ].map((item) => (
          <div key={item.label} className="rounded-lg border border-notion-border overflow-hidden">
            <div className="px-4 py-2.5 bg-notion-bg-secondary border-b border-notion-border">
              <span className="text-[12px] font-semibold" style={{ color: item.color }}>{item.label}</span>
            </div>
            <div className="px-4 py-3">
              <p className="text-[13px] text-notion-text-secondary leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <Callout type="warning" title="Refresh token deve ser da conta correta">
        Ao regenerar o token via <code className="font-mono text-[12px]">node scripts/get-google-ads-token.cjs</code>,
        o browser deve estar logado com <strong>growth@behonestbrasil.com.br</strong>.
        Se outro Google Account for usado, todas as chamadas retornam{' '}
        <code className="font-mono text-[12px]">500 INTERNAL</code> sem mensagem explicativa.
        O script mostra a conta usada no terminal após o fluxo.
      </Callout>

      <H2 id="mcc" icon={<Database size={15} />}>Conta Gerente (MCC)</H2>

      <p className="text-[14px] text-notion-text-secondary leading-relaxed mb-4">
        Ao inicializar, o backend executa a função <code className="font-mono text-[12px]">listClientIds()</code>{' '}
        em <code className="font-mono text-[12px]">server/google-ads.js</code>, que consulta o recurso{' '}
        <code className="font-mono text-[12px]">customer_client</code> do MCC para descobrir sub-contas ativas
        (nível 1, não-gerentes). O resultado é cacheado em memória durante o processo.
      </p>

      <div className="rounded-lg border border-notion-border bg-notion-bg-secondary p-4 font-mono text-[12px] text-notion-text-secondary leading-loose mb-5">
        <p className="text-notion-text-tertiary"># GAQL para descoberta de sub-contas</p>
        <p>SELECT customer_client.id,</p>
        <p className="pl-4">customer_client.descriptive_name,</p>
        <p className="pl-4">customer_client.manager,</p>
        <p className="pl-4">customer_client.level,</p>
        <p className="pl-4">customer_client.status</p>
        <p>FROM customer_client</p>
        <p>WHERE customer_client.level = 1</p>
        <p className="pl-4">AND customer_client.manager = false</p>
      </div>

      <p className="text-[14px] text-notion-text-secondary leading-relaxed mb-5">
        Para queries de campanhas e adgroups, o backend usa <code className="font-mono text-[12px]">gadsQueryAll()</code>
        — que executa a query em <em>todas</em> as sub-contas e mescla os resultados. Para adgroups e
        anúncios, usa <code className="font-mono text-[12px]">gadsQuery(gaql, clientId)</code> com o
        client ID embutido no ID composto da campanha.
      </p>

      <H3>IDs compostos</H3>

      <p className="text-[14px] text-notion-text-secondary leading-relaxed mb-4">
        Para permitir drill-down correto quando há múltiplas sub-contas, o backend gera IDs compostos:
      </p>

      <div className="rounded-lg border border-notion-border bg-notion-bg-secondary p-4 font-mono text-[12px] text-notion-text-secondary leading-loose mb-6">
        <p className="text-notion-text-tertiary"># Formato dos IDs na API interna</p>
        <p>Campanha:       <span className="text-[#2383E2]">{'"{clientId}:{campaignId}"'}</span>  ex: "7171407962:23513685510"</p>
        <p>Grupo de Anúnc: <span className="text-[#0F7B6C]">{'"{clientId}:{adGroupId}"'}</span>   ex: "7171407962:154321000"</p>
        <p className="text-notion-text-tertiary mt-1"># O frontend passa o ID composto nos parâmetros de rota</p>
        <p>/api/gads/campaigns/<span className="text-[#D97706]">7171407962:23513685510</span>/adgroups</p>
      </div>

      <H2 id="endpoints" icon={<Server size={15} />}>Endpoints da API interna</H2>

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
              { ep: '/api/gads/ping',                         desc: 'Health check — verifica token, email e client IDs descobertos',  params: '—' },
              { ep: '/api/gads/overview',                     desc: 'Métricas diárias agregadas de todas as sub-contas',               params: 'date_preset | since+until' },
              { ep: '/api/gads/campaigns',                    desc: 'Lista de campanhas com métricas do período',                      params: 'date_preset | since+until' },
              { ep: '/api/gads/campaigns/:id/adgroups',       desc: 'Grupos de anúncios de uma campanha (ID composto)',                params: 'date_preset | since+until' },
              { ep: '/api/gads/adgroups/:id/ads',             desc: 'Anúncios de um grupo (ID composto)',                             params: 'date_preset | since+until' },
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

      <H3>Presets de data</H3>

      <div className="overflow-x-auto rounded-lg border border-notion-border mb-6">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-notion-bg-secondary border-b border-notion-border">
              {['Parâmetro', 'GAQL equivalente'].map((h) => (
                <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold text-notion-text-secondary uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { p: 'last_7d',    g: 'LAST_7_DAYS' },
              { p: 'last_14d',   g: 'LAST_14_DAYS' },
              { p: 'last_30d',   g: 'LAST_30_DAYS' },
              { p: 'this_month', g: 'THIS_MONTH' },
              { p: 'last_month', g: 'LAST_MONTH' },
              { p: 'since+until', g: "BETWEEN 'YYYY-MM-DD' AND 'YYYY-MM-DD'" },
            ].map((row) => (
              <tr key={row.p} className="border-b border-notion-border last:border-0">
                <td className="px-4 py-2.5"><code className="font-mono text-[12px] text-[#2383E2]">{row.p}</code></td>
                <td className="px-4 py-2.5"><code className="font-mono text-[12px] text-notion-text-secondary">{row.g}</code></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <H2 id="normalizacao" icon={<Zap size={15} />}>Normalização de métricas</H2>

      <p className="text-[14px] text-notion-text-secondary leading-relaxed mb-4">
        A Google Ads API retorna valores em formatos específicos que precisam ser convertidos.
        A função <code className="font-mono text-[12px]">normMetrics()</code> em{' '}
        <code className="font-mono text-[12px]">server/app.js</code> cuida disso:
      </p>

      <div className="overflow-x-auto rounded-lg border border-notion-border mb-5">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-notion-bg-secondary border-b border-notion-border">
              {['Campo Google Ads', 'Transformação', 'Campo no painel'].map((h) => (
                <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold text-notion-text-secondary uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { raw: 'metrics.cost_micros',         tx: '÷ 1.000.000',        out: 'spend (R$)' },
              { raw: 'metrics.ctr',                 tx: '× 100',               out: 'ctr (%)' },
              { raw: 'metrics.average_cpm',         tx: '÷ 1.000.000',        out: 'cpm (R$)' },
              { raw: 'metrics.average_cpc',         tx: '÷ 1.000.000',        out: 'cpc (R$)' },
              { raw: 'metrics.cost_per_conversion', tx: '÷ 1.000.000',        out: 'costPerConversion (R$)' },
              { raw: 'conversions / clicks',        tx: '× 100 (calculado)',  out: 'conversionRate (%)' },
            ].map((row) => (
              <tr key={row.raw} className="border-b border-notion-border last:border-0 hover:bg-notion-bg-secondary/50 transition-colors">
                <td className="px-4 py-2.5"><code className="font-mono text-[11px] text-notion-text-secondary">{row.raw}</code></td>
                <td className="px-4 py-2.5 text-[13px] text-notion-text-secondary">{row.tx}</td>
                <td className="px-4 py-2.5"><code className="font-mono text-[11px] text-[#0F7B6C]">{row.out}</code></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Callout type="note" title="conversion_rate removido na v20">
        O campo <code className="font-mono text-[12px]">metrics.conversion_rate</code> foi removido
        da Google Ads API v20. O painel calcula a taxa de conversão manualmente como{' '}
        <code className="font-mono text-[12px]">conversions / clicks × 100</code>. O campo{' '}
        <code className="font-mono text-[12px]">metrics.cost_per_conversion</code> ainda está disponível.
      </Callout>

      <H2 id="versoes" icon={<AlertTriangle size={15} />}>Versões da API e migrações</H2>

      <p className="text-[14px] text-notion-text-secondary leading-relaxed mb-4">
        A Google Ads API tem ciclo de vida de ~12 meses por versão. O painel usa{' '}
        <strong>v20</strong> (lançada em maio/2025). Versões mais antigas retornam 404.
      </p>

      <div className="overflow-x-auto rounded-lg border border-notion-border mb-5">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-notion-bg-secondary border-b border-notion-border">
              {['Versão', 'Status (mar/2026)', 'Observação'].map((h) => (
                <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold text-notion-text-secondary uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { v: 'v17 e anteriores', status: 'Sunset (404)',    obs: 'Descontinuadas, retornam 404' },
              { v: 'v18',             status: 'Sunset (404)',    obs: 'Descontinuada desde ~nov/2025' },
              { v: 'v19',             status: 'Sunset (500)',    obs: 'Retorna erros inconsistentes, NÃO USAR' },
              { v: 'v20',             status: '✅ Ativo',         obs: 'Versão atual do painel. pageSize removido.' },
              { v: 'v21, v22, v23',   status: '✅ Disponíveis',  obs: 'Funcionam, mas v20 é suficiente' },
            ].map((row) => (
              <tr key={row.v} className="border-b border-notion-border last:border-0 hover:bg-notion-bg-secondary/50 transition-colors">
                <td className="px-4 py-2.5"><code className="font-mono text-[12px] text-notion-text-primary">{row.v}</code></td>
                <td className="px-4 py-2.5 text-[13px] text-notion-text-secondary">{row.status}</td>
                <td className="px-4 py-2.5 text-[12px] text-notion-text-tertiary">{row.obs}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <H3>Diferenças v19 → v20</H3>

      <div className="space-y-2 mb-6">
        {[
          { item: 'pageSize removido do request body', detail: 'Na v20, o pageSize é fixo em 10.000 linhas. Enviar pageSize causa erro 400 INVALID_ARGUMENT.' },
          { item: 'metrics.conversion_rate removido',  detail: 'Campo não existe mais. Calcular manualmente como conversions / clicks × 100.' },
          { item: 'Erros mais descritivos',            detail: 'v20 retorna GoogleAdsFailure com errorCode e message detalhados, facilitando diagnóstico.' },
        ].map((row) => (
          <div key={row.item} className="flex items-start gap-3 p-3 rounded-lg border border-notion-border">
            <div className="w-1.5 h-1.5 rounded-full bg-[#D97706] flex-shrink-0 mt-2" />
            <div>
              <p className="text-[13px] font-medium text-notion-text-primary">{row.item}</p>
              <p className="text-[12px] text-notion-text-tertiary mt-0.5">{row.detail}</p>
            </div>
          </div>
        ))}
      </div>

      <H2 id="variaveis" icon={<Key size={15} />}>Variáveis de ambiente</H2>

      <div className="overflow-x-auto rounded-lg border border-notion-border mb-5">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-notion-bg-secondary border-b border-notion-border">
              {['Variável', 'Descrição', 'Onde obter'].map((h) => (
                <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold text-notion-text-secondary uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { v: 'GOOGLE_CLIENT_ID',           desc: 'OAuth 2.0 Client ID do Google Cloud',       how: 'Google Cloud Console → Credentials' },
              { v: 'GOOGLE_CLIENT_SECRET',        desc: 'OAuth 2.0 Client Secret',                   how: 'Google Cloud Console → Credentials' },
              { v: 'GOOGLE_REFRESH_TOKEN',        desc: 'Refresh token com escopos adwords+sheets',  how: 'node scripts/get-google-ads-token.cjs' },
              { v: 'GOOGLE_ADS_DEVELOPER_TOKEN',  desc: 'Token do desenvolvedor Google Ads',         how: 'Google Ads → Ferramentas → API Center' },
              { v: 'GOOGLE_ADS_CUSTOMER_ID',      desc: 'ID numérico do MCC (sem traços)',            how: 'Google Ads → URL da conta (ex: 2380840433)' },
            ].map((row) => (
              <tr key={row.v} className="border-b border-notion-border last:border-0 hover:bg-notion-bg-secondary/50 transition-colors">
                <td className="px-4 py-2.5"><code className="font-mono text-[11px] text-[#D97706] bg-[#FFF8ED] px-1.5 py-0.5 rounded">{row.v}</code></td>
                <td className="px-4 py-2.5 text-[13px] text-notion-text-secondary">{row.desc}</td>
                <td className="px-4 py-2.5 text-[12px] text-notion-text-tertiary">{row.how}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Callout type="tip" title="Regenerar refresh token">
        Para regenerar o token, rode <code className="font-mono text-[12px]">node scripts/get-google-ads-token.cjs</code>,
        confirme que o terminal mostra <strong>growth@behonestbrasil.com.br</strong>, e então atualize no Vercel com:{' '}
        <code className="font-mono text-[12px]">printf "TOKEN" | vercel env add GOOGLE_REFRESH_TOKEN production --force</code>
      </Callout>

      <NavCards
        label="Próximos passos"
        cards={[
          { title: 'Como o painel funciona', description: 'Visão técnica completa da arquitetura — Meta Ads, CRM, Google Sheets e deploy.', to: '/docs/como-funciona' },
          { title: 'Fontes de Dados',         description: 'Planilhas Google que alimentam o CRM e o significado de cada coluna.',           to: '/docs/fontes-dados' },
        ]}
      />
    </PageShell>
  );
}
