import { Globe } from 'lucide-react';
import { PageShell } from '../_components/PageShell';
import { Callout } from '../_components/Callout';
import { NavCards } from '../_components/NavCards';
import { H2, H3 } from '../_components/H2';

const TOC = [
  { id: 'foco-captacao',   label: 'Campo Foco Captação' },
  { id: 'captacao-meio',   label: 'Captação Meio' },
  { id: 'captacao-fundo',  label: 'Captação Fundo' },
  { id: 'especial',        label: 'Especial' },
  { id: 'logica-mapeamento', label: 'Lógica de mapeamento' },
];

const URL_GROUPS = [
  {
    type: 'CAPTAÇÃO MEIO',
    color: '#9333EA',
    border: '#DDD6FE',
    bg: '#F5F3FF',
    desc: 'Webinar, Comunidade, Simulador Financeiro — topo e meio de funil',
    rows: [
      { url: 'lp.behonest.com.br/',                    canal: 'Webinar', desc: 'Landing page principal do webinar' },
      { url: 'lp.behonest.com.br/comunidade',          canal: 'Grupo Empreenda / Comunidade', desc: 'Cadastro no grupo da comunidade' },
      { url: 'lp.behonest.com.br/simulador-financeiro', canal: 'Simulador Financeiro', desc: 'Ferramenta de simulação de retorno' },
    ],
  },
  {
    type: 'CAPTAÇÃO FUNDO',
    color: '#0F7B6C',
    border: '#A7F3D0',
    bg: '#ECFDF5',
    desc: 'Landing pages de conversão direta — leads com alta intenção de compra',
    rows: [
      { url: 'behonestbrasil.com.br/fazer-negocio-operador/',       canal: 'LP Operador — Meta Ads',    desc: 'LP principal para tráfego pago no Meta' },
      { url: 'behonestbrasil.com.br/fazer-negocio-operador-google', canal: 'LP Operador — Google Ads',  desc: 'Variante da LP para Google Ads'          },
      { url: 'lp.behonest.com.br/meta',                             canal: 'LP Direta — Meta Ads',      desc: 'LP direta com conversão rápida'          },
      { url: 'lp.behonest.com.br/google',                           canal: 'LP Direta — Google Ads',    desc: 'Equivalente Google da LP direta'         },
    ],
  },
  {
    type: 'ESPECIAL',
    color: '#D97706',
    border: '#FDE68A',
    bg: '#FFFBEB',
    desc: 'Captação de eventos e ações pontuais',
    rows: [
      { url: 'lp.behonest.com.br/operacao-behonest', canal: 'Evento presencial',  desc: 'Cadastro para o evento presencial Be Honest' },
      { url: 'lp.behonest.com.br/aulao-grupo',       canal: 'Aulão da comunidade', desc: 'Cadastro no aulão semanal — exclusivo membros do Grupo Comunidade' },
    ],
  },
];

export function PaginasCanalPage() {
  return (
    <PageShell
      badge="Fontes de Dados"
      title="Páginas & Canal"
      description="Como a URL da página de conversão determina o campo Foco Captação — a classificação de canal que segmenta os leads por posição no funil."
      toc={TOC}
    >
      <H2 id="foco-captacao" icon={<Globe size={15} />}>Campo Foco Captação</H2>

      <p className="text-[14px] text-notion-text-secondary leading-relaxed mb-4">
        O campo <strong>Foco Captação</strong> é gerado automaticamente pelo script de sync a partir
        da URL no campo <code className="font-mono text-[12px] bg-notion-bg-secondary border border-notion-border px-1.5 py-0.5 rounded">Page</code> de cada lead.
        Não requer preenchimento manual.
      </p>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'CAPTAÇÃO MEIO',  color: '#9333EA', bg: '#F5F3FF', border: '#DDD6FE', desc: 'Topo e meio de funil — leads em fase de consideração' },
          { label: 'CAPTAÇÃO FUNDO', color: '#0F7B6C', bg: '#ECFDF5', border: '#A7F3D0', desc: 'Fundo de funil — leads com alta intenção (levantada de mão)' },
          { label: 'ESPECIAL',       color: '#D97706', bg: '#FFFBEB', border: '#FDE68A', desc: 'Eventos e ações pontuais com captação específica' },
        ].map((item) => (
          <div key={item.label} className="rounded-lg border p-3 text-center" style={{ borderColor: item.border, background: item.bg }}>
            <span className="text-[11px] font-bold tracking-widest uppercase px-2 py-0.5 rounded text-white block mb-1.5" style={{ background: item.color }}>
              {item.label}
            </span>
            <p className="text-[11px] text-notion-text-secondary leading-snug">{item.desc}</p>
          </div>
        ))}
      </div>

      <Callout type="warning" title="Impacto na classificação">
        O tipo de captação influencia diretamente na classificação de estágio. Leads de
        <strong> CAPTAÇÃO FUNDO</strong> entram no fluxo de "levantada de mão" — podem ser
        classificados como MQL ou MQL RECUSADO. Leads de <strong>CAPTAÇÃO MEIO</strong> passam
        pelo fluxo LEAD → PRÉ-MQL → MQL.
      </Callout>

      <H2 id="captacao-meio">Captação Meio</H2>

      <p className="text-[14px] text-notion-text-secondary leading-relaxed mb-4">
        Páginas de meio de funil captam leads em fase de aprendizado e consideração. O engajamento
        com conteúdo (webinar, simulador) indica interesse, mas ainda não representa uma solicitação
        de conversa comercial.
      </p>

      <UrlTable group={URL_GROUPS[0]} />

      <H2 id="captacao-fundo">Captação Fundo</H2>

      <p className="text-[14px] text-notion-text-secondary leading-relaxed mb-4">
        Páginas de fundo de funil são voltadas para leads com alta intenção. Converter nessas páginas
        é interpretado como uma <strong>levantada de mão</strong> — o lead está pedindo ativamente
        para falar com o time comercial.
      </p>

      <UrlTable group={URL_GROUPS[1]} />

      <H2 id="especial">Especial</H2>

      <p className="text-[14px] text-notion-text-secondary leading-relaxed mb-4">
        Páginas de captação especial são usadas para eventos e ações pontuais. Esses leads têm um
        contexto diferente dos leads de funil padrão e são marcados separadamente para facilitar
        segmentação e análise.
      </p>

      <UrlTable group={URL_GROUPS[2]} />

      <H2 id="logica-mapeamento">Lógica de mapeamento</H2>

      <H3>Regra de matching</H3>
      <p className="text-[14px] text-notion-text-secondary leading-relaxed mb-4">
        O script verifica se a URL do lead contém algum dos padrões mapeados. A verificação é feita
        por substring (<code className="font-mono text-[12px] bg-notion-bg-secondary border border-notion-border px-1.5 py-0.5 rounded">includes</code>), então subpáginas são corretamente identificadas.
      </p>

      <div className="rounded-lg border border-notion-border bg-notion-bg-secondary p-4 font-mono text-[12.5px] mb-4 space-y-1.5">
        <p className="text-notion-text-tertiary"># Ordem de prioridade de mapeamento</p>
        <p><span className="text-[#9333EA]">1. Meio:</span>  /webinar, /comunidade, /simulador-financeiro</p>
        <p><span className="text-[#0F7B6C]">2. Fundo:</span> /fazer-negocio-operador, /meta, /google</p>
        <p><span className="text-[#D97706]">3. Especial:</span> /operacao-behonest, /aulao-grupo</p>
        <p className="text-notion-text-tertiary mt-1"># Se nenhum padrão for encontrado → "CAPTAÇÃO MEIO" (default)</p>
      </div>

      <Callout type="note">
        Se a URL não corresponder a nenhum padrão conhecido, o lead recebe{' '}
        <strong>CAPTAÇÃO MEIO</strong> por padrão. Isso garante que nenhum lead fique sem
        classificação de canal.
      </Callout>

      <NavCards
        cards={[
          { title: 'Auto-Evolução', description: 'Como o Foco Captação influencia a classificação de estágio do lead.',   to: '/docs/auto-evolucao' },
          { title: 'Fontes de Dados', description: 'Onde o campo Foco Captação é armazenado nas planilhas.',              to: '/docs/fontes-dados'  },
        ]}
      />
    </PageShell>
  );
}

function UrlTable({ group }: { group: typeof URL_GROUPS[0] }) {
  return (
    <div
      className="rounded-lg border border-notion-border overflow-hidden mb-6"
      style={{ borderLeftColor: group.color, borderLeftWidth: '3px' }}
    >
      <div className="px-4 py-2.5 bg-notion-bg-secondary border-b border-notion-border flex items-center gap-2">
        <span className="text-[11px] font-bold tracking-widest uppercase px-2 py-0.5 rounded text-white" style={{ background: group.color }}>
          {group.type}
        </span>
        <span className="text-[12px] text-notion-text-secondary">{group.desc}</span>
      </div>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-notion-border bg-notion-bg-primary">
            <th className="px-4 py-2 text-left text-[11px] font-semibold text-notion-text-secondary uppercase tracking-wider w-[45%]">URL</th>
            <th className="px-4 py-2 text-left text-[11px] font-semibold text-notion-text-secondary uppercase tracking-wider w-[30%]">Canal</th>
            <th className="px-4 py-2 text-left text-[11px] font-semibold text-notion-text-secondary uppercase tracking-wider">Descrição</th>
          </tr>
        </thead>
        <tbody>
          {group.rows.map((row) => (
            <tr key={row.url} className="border-b border-notion-border last:border-0 hover:bg-notion-bg-secondary/40 transition-colors">
              <td className="px-4 py-2.5">
                <code className="font-mono text-[11px] text-notion-text-primary bg-notion-bg-secondary border border-notion-border px-1.5 py-0.5 rounded break-all">
                  {row.url}
                </code>
              </td>
              <td className="px-4 py-2.5 text-[12px] text-notion-text-secondary">{row.canal}</td>
              <td className="px-4 py-2.5 text-[12px] text-notion-text-tertiary">{row.desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
