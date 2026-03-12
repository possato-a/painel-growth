import { Ban, XCircle } from 'lucide-react';
import { PageShell } from '../_components/PageShell';
import { Callout } from '../_components/Callout';
import { NavCards } from '../_components/NavCards';
import { H2, H3 } from '../_components/H2';
import { Code } from '../_components/CodeBlock';

const TOC = [
  { id: 'visao-geral',       label: 'Visão geral' },
  { id: 'lista-exclusao',    label: 'Lista de exclusão' },
  { id: 'filtro-teste',      label: 'Filtro de entradas de teste' },
  { id: 'quando-aplicado',   label: 'Quando é aplicado' },
];

const EXCLUDED_PEOPLE = [
  { name: 'Francisco Possato',                  reason: 'Administrador do sistema' },
  { name: 'Carlos Fernandes',                   reason: 'Membro interno da equipe' },
  { name: 'João Gabriel dos Santos dos Anjos',  reason: 'Membro interno da equipe' },
];

export function ExclusoesPage() {
  return (
    <PageShell
      badge="Referência"
      title="Exclusões — Filtros de Qualidade"
      description="Quais registros são automaticamente removidos durante a sincronização e por que — garantindo que apenas leads legítimos sejam contabilizados."
      toc={TOC}
    >
      <H2 id="visao-geral" icon={<Ban size={15} />}>Visão geral</H2>

      <p className="text-[14px] text-notion-text-secondary leading-relaxed mb-4">
        Durante a sincronização, o script aplica dois filtros de qualidade <strong>antes</strong> de
        processar qualquer lead. Os registros excluídos não aparecem em nenhuma contagem, tabela,
        relatório ou análise do painel.
      </p>

      <p className="text-[14px] text-notion-text-secondary leading-relaxed mb-5">
        A exclusão é aplicada na <strong>etapa 2</strong> do processo de sync — imediatamente após
        a leitura da fonte primária e antes de qualquer classificação.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        {[
          { icon: '🚫', title: 'Lista de exclusão', desc: 'Três pessoas específicas identificadas por nome ou email. Usada para filtrar membros internos da equipe.' },
          { icon: '🧪', title: 'Filtro de teste', desc: 'Qualquer lead cujo nome ou email contenha palavras-chave de teste. Usada para remover entradas criadas durante desenvolvimento.' },
        ].map((item) => (
          <div key={item.title} className="rounded-lg border border-notion-border p-4 bg-notion-bg-secondary">
            <span className="text-2xl">{item.icon}</span>
            <p className="text-[13px] font-semibold text-notion-text-primary mt-2">{item.title}</p>
            <p className="text-[12px] text-notion-text-secondary mt-1 leading-snug">{item.desc}</p>
          </div>
        ))}
      </div>

      <H2 id="lista-exclusao">Lista de exclusão</H2>

      <p className="text-[14px] text-notion-text-secondary leading-relaxed mb-4">
        Os registros abaixo são identificados por <strong>nome ou email</strong> e excluídos
        permanentemente do CRM. A verificação é feita por comparação exata (case-insensitive).
      </p>

      <div className="rounded-lg border border-notion-border overflow-hidden mb-5">
        <div className="px-4 py-2.5 bg-notion-bg-secondary border-b border-notion-border">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-notion-text-tertiary">
            Pessoas excluídas permanentemente
          </p>
        </div>
        <div className="px-4 py-3 flex flex-wrap gap-2">
          {EXCLUDED_PEOPLE.map(({ name, reason }) => (
            <div key={name} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border" style={{ background: '#FFF5F5', borderColor: '#FECACA' }}>
              <XCircle size={12} style={{ color: '#E03E3E' }} />
              <div>
                <p className="text-[12px] font-medium" style={{ color: '#E03E3E' }}>{name}</p>
                <p className="text-[10px] text-notion-text-tertiary">{reason}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Callout type="note">
        Para adicionar ou remover pessoas desta lista, edite o array de exclusão no arquivo{' '}
        <Code>server/crm-sync.js</Code> e faça um novo deploy.
      </Callout>

      <H2 id="filtro-teste">Filtro de entradas de teste</H2>

      <p className="text-[14px] text-notion-text-secondary leading-relaxed mb-4">
        Qualquer lead cujo <strong>nome</strong> ou <strong>email</strong> contenha uma das
        palavras-chave abaixo é automaticamente descartado:
      </p>

      <div className="flex flex-wrap gap-2 mb-5">
        {['teste', 'test', '@test'].map((kw) => (
          <Code key={kw}>{kw}</Code>
        ))}
      </div>

      <H3>Exemplos de entradas filtradas</H3>
      <div className="overflow-x-auto rounded-lg border border-notion-border mb-5">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-notion-bg-secondary border-b border-notion-border">
              {['Nome', 'Email', 'Motivo de exclusão'].map((h) => (
                <th key={h} className="px-4 py-2 text-left text-[11px] font-semibold text-notion-text-secondary uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { nome: 'Teste Lead',     email: 'qualquer@email.com',  motivo: 'Nome contém "Teste"'     },
              { nome: 'João Silva',     email: 'joao@test.com',        motivo: 'Email contém "@test"'    },
              { nome: 'Test User',      email: 'test@test.com',        motivo: 'Nome e email com "test"' },
              { nome: 'Maria (teste)',  email: 'maria@email.com',      motivo: 'Nome contém "teste"'     },
            ].map((row, i) => (
              <tr key={i} className="border-b border-notion-border last:border-0 hover:bg-notion-bg-secondary/50 transition-colors">
                <td className="px-4 py-2.5 text-[13px] text-notion-text-secondary">{row.nome}</td>
                <td className="px-4 py-2.5">
                  <code className="font-mono text-[12px] text-notion-text-secondary">{row.email}</code>
                </td>
                <td className="px-4 py-2.5">
                  <span className="text-[11px] px-2 py-0.5 rounded" style={{ color: '#E03E3E', background: '#FFF5F5', border: '1px solid #FECACA' }}>
                    {row.motivo}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Callout type="tip">
        A comparação é <strong>case-insensitive</strong> — "TESTE", "Teste" e "teste" são todos
        filtrados. Isso evita falsos negativos por variação de capitalização nos formulários.
      </Callout>

      <H2 id="quando-aplicado">Quando é aplicado</H2>

      <p className="text-[14px] text-notion-text-secondary leading-relaxed mb-4">
        O filtro de exclusão é aplicado na <strong>etapa 2</strong> do script de sincronização,
        antes de qualquer outra operação. Isso garante que leads excluídos não consumam recursos
        de processamento nem poluam o cache local.
      </p>

      <div className="rounded-lg border border-notion-border bg-notion-bg-secondary p-4 font-mono text-[12.5px] text-notion-text-secondary mb-4">
        <p className="text-notion-text-tertiary"># Ordem das etapas de sync</p>
        <p>1. Leitura da fonte primária</p>
        <p className="text-[#E03E3E]">2. ← Filtros de qualidade (lista + teste)</p>
        <p>3. Atribuição de ID</p>
        <p>4. Classificação de canal</p>
        <p>5. Classificação de estágio</p>
        <p>...</p>
      </div>

      <NavCards
        cards={[
          { title: 'Sincronização do CRM', description: 'O fluxo completo das 7 etapas do script de sync.',                         to: '/docs/sincronizacao' },
          { title: 'Regras de ID',         description: 'Como o ID é atribuído após a filtragem — etapa 3 do sync.',                 to: '/docs/regras-id'     },
        ]}
      />
    </PageShell>
  );
}
