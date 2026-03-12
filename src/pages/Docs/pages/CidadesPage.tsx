import { MapPin } from 'lucide-react';
import { PageShell } from '../_components/PageShell';
import { Callout } from '../_components/Callout';
import { NavCards } from '../_components/NavCards';
import { H2, H3 } from '../_components/H2';

const TOC = [
  { id: 'definicao',  label: 'O que é "na praça"' },
  { id: 'mg',         label: 'Minas Gerais' },
  { id: 'go',         label: 'Goiás' },
  { id: 'df',         label: 'Distrito Federal' },
  { id: 'impacto',    label: 'Impacto na classificação' },
];

const REGIONS = [
  {
    id: 'mg',
    state: 'Minas Gerais (MG)',
    color: '#2383E2', bg: '#EBF4FF', border: '#BFDBFE',
    groups: [
      {
        label: 'Franquias',
        desc: 'Cidades com unidade Be Honest ativa',
        cities: ['Belo Horizonte', 'Nova Lima', 'Contagem', 'Betim', 'Ribeirão das Neves', 'Santa Luzia', 'Sabará', 'Ibirité', 'Vespasiano', 'Lagoa Santa', 'Pedro Leopoldo', 'Sete Lagoas', 'Juiz de Fora', 'Uberlândia', 'Uberaba'],
      },
      {
        label: 'Emergentes',
        desc: 'Cidades em processo de expansão',
        cities: ['Governador Valadares', 'Montes Claros', 'Poços de Caldas', 'Pouso Alegre', 'Divinópolis', 'Ipatinga', 'Barbacena'],
      },
    ],
  },
  {
    id: 'go',
    state: 'Goiás (GO)',
    color: '#0F7B6C', bg: '#ECFDF5', border: '#A7F3D0',
    groups: [
      {
        label: 'Franquias',
        desc: 'Cidades com unidade Be Honest ativa',
        cities: ['Goiânia', 'Aparecida de Goiânia', 'Anápolis'],
      },
      {
        label: 'Emergentes',
        desc: 'Cidades em processo de expansão',
        cities: ['Rio Verde', 'Catalão'],
      },
    ],
  },
  {
    id: 'df',
    state: 'Distrito Federal (DF)',
    color: '#9333EA', bg: '#F5F3FF', border: '#DDD6FE',
    groups: [
      {
        label: 'Franquias',
        desc: 'Regiões administrativas com unidade Be Honest ativa',
        cities: ['Brasília', 'Taguatinga', 'Ceilândia', 'Águas Claras'],
      },
    ],
  },
];

export function CidadesPage() {
  return (
    <PageShell
      badge="Referência"
      title="Cidades de Operação (Praça)"
      description="A lista completa de cidades onde a Be Honest opera ou está em expansão — determina se um lead é classificado como 'na praça' no processo de auto-evolução."
      toc={TOC}
    >
      <H2 id="definicao" icon={<MapPin size={15} />}>O que é "na praça"</H2>

      <p className="text-[14px] text-notion-text-secondary leading-relaxed mb-4">
        Um lead é considerado <strong>"na praça"</strong> quando a cidade informada no cadastro
        consta na lista de cidades de operação da Be Honest. Esse critério é um dos três
        determinantes para a classificação de estágio.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        {[
          {
            cond: 'Na praça ✓',
            color: '#0F7B6C', bg: '#ECFDF5', border: '#A7F3D0',
            items: ['Pode evoluir para PRÉ-MQL e MQL', 'Avaliado para os outros dois critérios (capital e levantada de mão)'],
          },
          {
            cond: 'Fora da praça ✗',
            color: '#E03E3E', bg: '#FFF5F5', border: '#FECACA',
            items: ['Meio de funil → classificado como LEAD PERDIDO', 'Fundo de funil → classificado como MQL RECUSADO'],
          },
        ].map((item) => (
          <div key={item.cond} className="rounded-lg border overflow-hidden" style={{ borderColor: item.border }}>
            <div className="px-4 py-2.5 border-b" style={{ background: item.bg, borderColor: item.border }}>
              <p className="text-[12px] font-bold" style={{ color: item.color }}>{item.cond}</p>
            </div>
            <ul className="px-4 py-3 space-y-1.5 bg-notion-bg-primary">
              {item.items.map((t, i) => (
                <li key={i} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5" style={{ background: item.color }} />
                  <span className="text-[13px] text-notion-text-secondary">{t}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Summary stats */}
      <div className="flex items-center gap-4 flex-wrap mb-6">
        {[
          { label: 'MG', count: '22 cidades', color: '#2383E2', bg: '#EBF4FF', border: '#BFDBFE' },
          { label: 'GO', count: '5 cidades',  color: '#0F7B6C', bg: '#ECFDF5', border: '#A7F3D0' },
          { label: 'DF', count: '4 regiões',  color: '#9333EA', bg: '#F5F3FF', border: '#DDD6FE' },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-2 px-3 py-2 rounded-lg border" style={{ background: s.bg, borderColor: s.border }}>
            <span className="text-[12px] font-bold" style={{ color: s.color }}>{s.label}</span>
            <span className="text-[12px] text-notion-text-secondary">{s.count}</span>
          </div>
        ))}
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-notion-border bg-notion-bg-secondary">
          <span className="text-[12px] font-bold text-notion-text-primary">Total</span>
          <span className="text-[12px] text-notion-text-secondary">31 localidades</span>
        </div>
      </div>

      {REGIONS.map((region) => (
        <section key={region.id}>
          <H2 id={region.id} icon={<MapPin size={15} />}>{region.state}</H2>

          <div className="space-y-3 mb-6">
            {region.groups.map((g) => (
              <div
                key={g.label}
                className="rounded-lg border border-notion-border overflow-hidden"
                style={{ borderLeftColor: region.color, borderLeftWidth: '3px' }}
              >
                <div className="px-4 py-2.5 bg-notion-bg-secondary border-b border-notion-border">
                  <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: region.color }}>
                    {g.label}
                  </span>
                  <span className="text-[11px] text-notion-text-tertiary ml-2">— {g.desc}</span>
                </div>
                <div className="px-4 py-3 bg-notion-bg-primary">
                  <div className="flex flex-wrap gap-1.5">
                    {g.cities.map((c) => (
                      <span
                        key={c}
                        className="text-[11px] font-medium px-2 py-0.5 rounded border"
                        style={{ background: region.bg, color: region.color, borderColor: region.border }}
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      <Callout type="warning">
        Cidades marcadas como <strong>BID</strong> (Business Intelligence Discovery) são usadas
        apenas para análise interna de mercado e <strong>não</strong> classificam leads como "na
        praça" — não aparecem nesta lista.
      </Callout>

      <H2 id="impacto">Impacto na classificação</H2>

      <p className="text-[14px] text-notion-text-secondary leading-relaxed mb-4">
        A verificação de praça é feita durante a etapa 5 (Classificação de Estágio) do script de
        sync. A cidade do lead é comparada com a lista de cidades por string match
        case-insensitive, com normalização de acentos.
      </p>

      <H3>Atualizar a lista de cidades</H3>
      <p className="text-[14px] text-notion-text-secondary leading-relaxed mb-4">
        Para adicionar ou remover cidades da praça, edite o array de cidades no arquivo{' '}
        <code className="font-mono text-[12px] bg-notion-bg-secondary border border-notion-border px-1.5 py-0.5 rounded">server/crm-sync.js</code>{' '}
        (constante <code className="font-mono text-[12px] bg-notion-bg-secondary border border-notion-border px-1.5 py-0.5 rounded">CIDADES_PRACA</code>)
        e faça um novo deploy.
      </p>

      <Callout type="note">
        Após atualizar a lista de cidades, execute uma sincronização manual para reclassificar
        os leads existentes com a nova lista.
      </Callout>

      <NavCards
        cards={[
          { title: 'Auto-Evolução',          description: 'Como a praça é avaliada em conjunto com capital e levantada de mão.', to: '/docs/auto-evolucao'        },
          { title: 'Classificação de Leads', description: 'Os estágios que resultam de cada combinação de critérios.',           to: '/docs/classificacao-leads'  },
        ]}
      />
    </PageShell>
  );
}
