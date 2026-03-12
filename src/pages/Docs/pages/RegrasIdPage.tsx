import { Hash, CheckCircle, XCircle } from 'lucide-react';
import { PageShell } from '../_components/PageShell';
import { Callout } from '../_components/Callout';
import { NavCards } from '../_components/NavCards';
import { H2, H3 } from '../_components/H2';

const TOC = [
  { id: 'conceito',   label: 'Conceito de ID Lead' },
  { id: 'regras',     label: 'Regras e comportamento' },
  { id: 'exemplos',   label: 'Exemplos práticos' },
];

export function RegrasIdPage() {
  return (
    <PageShell
      badge="Referência"
      title="Regras de ID"
      description="Como o ID Lead é atribuído, por que ele identifica a pessoa e não a conversão, e como tratar reconversões do mesmo email."
      toc={TOC}
    >
      <H2 id="conceito" icon={<Hash size={15} />}>Conceito de ID Lead</H2>

      <p className="text-[14px] text-notion-text-secondary leading-relaxed mb-4">
        O <strong>ID Lead</strong> é um identificador único atribuído por <strong>e-mail</strong>.
        Ele representa a <em>pessoa</em>, não a conversão. O mesmo lead pode aparecer múltiplas
        vezes no CRM (uma linha por conversão) — todas as linhas terão o <strong>mesmo ID</strong>.
      </p>

      <p className="text-[14px] text-notion-text-secondary leading-relaxed mb-5">
        Essa decisão de design permite rastrear o histórico completo de um lead (múltiplas
        conversões em canais diferentes) enquanto mantém um identificador estável para o time
        comercial referenciar.
      </p>

      <Callout type="info">
        O ID é gerado deterministicamente a partir do email — o mesmo email sempre produz o mesmo
        ID, independente de quando o lead converteu ou quantas vezes.
      </Callout>

      <H2 id="regras">Regras e comportamento</H2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="rounded-lg border border-notion-border overflow-hidden" style={{ borderLeftColor: '#0F7B6C', borderLeftWidth: '3px' }}>
          <div className="px-4 py-2.5 bg-notion-bg-secondary border-b border-notion-border">
            <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#0F7B6C' }}>
              Comportamento esperado
            </p>
          </div>
          <ul className="px-4 py-3 space-y-2.5">
            {[
              'Mesmo email → mesmo ID em todas as linhas',
              'Conversões distintas → linhas separadas com o mesmo ID',
              '2 conversões no mesmo dia → 2 registros com o mesmo ID',
              'Reconversões rastreadas pela contagem de linhas por ID',
              'ID estável entre sincronizações — nunca muda',
            ].map((t, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle size={12} className="flex-shrink-0 mt-0.5" style={{ color: '#0F7B6C' }} />
                <span className="text-[13px] text-notion-text-primary">{t}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border border-notion-border overflow-hidden" style={{ borderLeftColor: '#E03E3E', borderLeftWidth: '3px' }}>
          <div className="px-4 py-2.5 bg-notion-bg-secondary border-b border-notion-border">
            <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#E03E3E' }}>
              Nunca fazer
            </p>
          </div>
          <ul className="px-4 py-3 space-y-2.5">
            {[
              'Criar ID novo para o mesmo email',
              'Mesclar linhas de conversões diferentes em um único registro',
              'Usar data como critério de unicidade',
              'Referenciar um lead pelo número de linha da planilha',
            ].map((t, i) => (
              <li key={i} className="flex items-start gap-2">
                <XCircle size={12} className="flex-shrink-0 mt-0.5" style={{ color: '#E03E3E' }} />
                <span className="text-[13px] text-notion-text-primary">{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <H2 id="exemplos">Exemplos práticos</H2>

      <H3>Cenário 1 — Lead com múltiplas conversões</H3>
      <p className="text-[14px] text-notion-text-secondary leading-relaxed mb-3">
        Maria converteu no Webinar em janeiro e depois na LP Operador em março.
      </p>
      <div className="overflow-x-auto rounded-lg border border-notion-border mb-5">
        <table className="w-full border-collapse min-w-[480px]">
          <thead>
            <tr className="bg-notion-bg-secondary border-b border-notion-border">
              {['ID Lead', 'Data', 'Página', 'Estágio'].map((h) => (
                <th key={h} className="px-4 py-2 text-left text-[11px] font-semibold text-notion-text-secondary uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { id: 'abc123', data: '15/01/2026', page: 'lp.behonest.com.br/ (Webinar)',     estagio: 'LEAD', ec: '#2383E2' },
              { id: 'abc123', data: '22/03/2026', page: '.../fazer-negocio-operador/ (LP)',   estagio: 'MQL',  ec: '#0F7B6C' },
            ].map((row, i) => (
              <tr key={i} className="border-b border-notion-border last:border-0 hover:bg-notion-bg-secondary/50 transition-colors">
                <td className="px-4 py-2.5">
                  <code className="font-mono text-[11px] bg-notion-bg-secondary border border-notion-border px-1.5 py-0.5 rounded">
                    {row.id}
                  </code>
                </td>
                <td className="px-4 py-2.5 text-[12px] text-notion-text-secondary">{row.data}</td>
                <td className="px-4 py-2.5 text-[12px] text-notion-text-secondary">{row.page}</td>
                <td className="px-4 py-2.5">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded" style={{ color: row.ec, background: `${row.ec}18` }}>
                    {row.estagio}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[13px] text-notion-text-secondary mb-6">
        Ambas as linhas têm o ID <code className="font-mono text-[12px] bg-notion-bg-secondary border border-notion-border px-1.5 py-0.5 rounded">abc123</code>.
        O sistema detecta que a segunda conversão (LP = fundo de funil) + email na praça + capital
        disponível → classifica como MQL.
      </p>

      <H3>Cenário 2 — Duas pessoas diferentes</H3>
      <p className="text-[14px] text-notion-text-secondary leading-relaxed mb-3">
        João e Ana converteram na mesma campanha. IDs diferentes porque emails diferentes.
      </p>
      <div className="overflow-x-auto rounded-lg border border-notion-border mb-6">
        <table className="w-full border-collapse min-w-[440px]">
          <thead>
            <tr className="bg-notion-bg-secondary border-b border-notion-border">
              {['ID Lead', 'Nome', 'Email', 'Estágio'].map((h) => (
                <th key={h} className="px-4 py-2 text-left text-[11px] font-semibold text-notion-text-secondary uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { id: 'abc123', nome: 'João Silva',  email: 'joao@email.com', estagio: 'LEAD',    ec: '#2383E2' },
              { id: 'xyz789', nome: 'Ana Costa',   email: 'ana@email.com',  estagio: 'PRÉ-MQL', ec: '#9333EA' },
            ].map((row, i) => (
              <tr key={i} className="border-b border-notion-border last:border-0 hover:bg-notion-bg-secondary/50 transition-colors">
                <td className="px-4 py-2.5">
                  <code className="font-mono text-[11px] bg-notion-bg-secondary border border-notion-border px-1.5 py-0.5 rounded">{row.id}</code>
                </td>
                <td className="px-4 py-2.5 text-[13px] text-notion-text-primary">{row.nome}</td>
                <td className="px-4 py-2.5 text-[12px] font-mono text-notion-text-secondary">{row.email}</td>
                <td className="px-4 py-2.5">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded" style={{ color: row.ec, background: `${row.ec}18` }}>
                    {row.estagio}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <NavCards
        cards={[
          { title: 'Exclusões',       description: 'Quais emails e nomes são filtrados antes da atribuição de ID.',          to: '/docs/exclusoes'   },
          { title: 'Fontes de Dados', description: 'Onde o campo ID Lead aparece nas planilhas e o que ele representa.',     to: '/docs/fontes-dados' },
        ]}
      />
    </PageShell>
  );
}
