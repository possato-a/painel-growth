import { Database } from 'lucide-react';
import { PageShell } from '../_components/PageShell';
import { Callout } from '../_components/Callout';
import { NavCards } from '../_components/NavCards';
import { H2, H3 } from '../_components/H2';

const TOC = [
  { id: 'fonte-primaria', label: 'Fonte primária' },
  { id: 'crm-enriquecido', label: 'CRM enriquecido' },
  { id: 'relacao',         label: 'Relação entre as fontes' },
];

const FONTE_PRIMARIA_COLS = [
  'Data', 'Hora', 'Nome e Sobrenome', 'Email', 'Celular', 'Cidade', 'Estado',
  'Disponibilidade de Investimento', 'MQL?', 'Page', 'Source', 'Medium',
  'Campaign', 'Content', 'Term',
];

const CRM_COLS = [
  'ID Lead', 'Data', 'Hora', 'Nome', 'Email', 'Celular', 'Cidade', 'Estado',
  'Canal', 'Página', 'Source', 'Campanha', 'Conjunto', 'Criativo', 'Estágio',
  'Investimento', 'Status Pipeline', 'Motivo de perda', 'Valor', 'Foco Captação',
];

export function FontesDadosPage() {
  return (
    <PageShell
      badge="Fontes de Dados"
      title="Planilhas Google"
      description="O CRM alimenta-se de duas planilhas no Google Sheets — a fonte primária de leads e o CRM enriquecido com dados comerciais."
      toc={TOC}
    >
      <p className="text-[14px] text-notion-text-secondary leading-relaxed mb-6">
        Todo lead presente no CRM enriquecido existe também na fonte primária. A sincronização
        mantém os dois documentos consistentes e nunca sobrescreve dados preenchidos manualmente
        pelo time comercial.
      </p>

      <H2 id="fonte-primaria" icon={<Database size={15} />}>Fonte primária — Leads Be Honest</H2>

      <div className="rounded-lg border border-notion-border overflow-hidden mb-6" style={{ borderLeftColor: '#2383E2', borderLeftWidth: '3px' }}>
        <div className="px-5 py-3 bg-notion-bg-secondary border-b border-notion-border">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold text-white px-2 py-0.5 rounded" style={{ background: '#2383E2' }}>
              Leads Be Honest
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded border" style={{ color: '#2383E2', background: '#EBF4FF', borderColor: '#BFDBFE' }}>
              Fonte primária
            </span>
          </div>
          <p className="text-[12px] font-medium mt-1.5" style={{ color: '#2383E2' }}>
            Fonte da verdade — histórico completo de leads
          </p>
        </div>
        <div className="px-5 py-4 bg-notion-bg-primary space-y-4">
          <div className="flex items-center gap-4 text-[12px] text-notion-text-secondary flex-wrap">
            <span>Aba: <code className="font-mono text-[12px] bg-notion-bg-secondary border border-notion-border px-1.5 py-0.5 rounded">Leads Franquia</code></span>
            <span className="text-notion-text-tertiary">·</span>
            <span>Disponível desde <strong>04/07/2025</strong></span>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-notion-text-tertiary mb-2">
              Colunas disponíveis
            </p>
            <div className="flex flex-wrap gap-1.5">
              {FONTE_PRIMARIA_COLS.map((c) => (
                <span key={c} className="text-[11px] font-mono bg-notion-bg-secondary border border-notion-border px-1.5 py-0.5 rounded text-notion-text-secondary">
                  {c}
                </span>
              ))}
            </div>
          </div>
          <Callout type="info">
            Automatizada — todos os novos leads chegam aqui automaticamente via integrações N8N
            das landing pages. Não requer preenchimento manual.
          </Callout>
        </div>
      </div>

      <H3>Campos de UTM</H3>
      <p className="text-[14px] text-notion-text-secondary leading-relaxed mb-4">
        Os campos de rastreamento UTM permitem mapear cada lead à campanha de origem:
      </p>
      <div className="overflow-x-auto rounded-lg border border-notion-border mb-6">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-notion-bg-secondary border-b border-notion-border">
              {['Campo', 'Uso', 'Exemplo'].map((h) => (
                <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold text-notion-text-secondary uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { campo: 'Source',   uso: 'Plataforma de tráfego',     ex: 'facebook, google'          },
              { campo: 'Medium',   uso: 'Tipo de mídia',              ex: 'cpc, organic, email'       },
              { campo: 'Campaign', uso: 'Nome da campanha',           ex: 'franquia-mg-bh-2026'       },
              { campo: 'Content',  uso: 'Variante do anúncio',        ex: 'video-depoimento-v2'       },
              { campo: 'Term',     uso: 'Palavra-chave (Google Ads)', ex: 'franquia de academia'      },
              { campo: 'Page',     uso: 'URL da página de conversão', ex: 'lp.behonest.com.br/webinar'},
            ].map((row) => (
              <tr key={row.campo} className="border-b border-notion-border last:border-0 hover:bg-notion-bg-secondary/50 transition-colors">
                <td className="px-4 py-2.5">
                  <code className="font-mono text-[12px] text-notion-text-primary bg-notion-bg-secondary border border-notion-border px-1.5 py-0.5 rounded">{row.campo}</code>
                </td>
                <td className="px-4 py-2.5 text-[13px] text-notion-text-secondary">{row.uso}</td>
                <td className="px-4 py-2.5 text-[12px] font-mono text-notion-text-tertiary">{row.ex}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <H2 id="crm-enriquecido" icon={<Database size={15} />}>CRM enriquecido — Painel de Growth</H2>

      <div className="rounded-lg border border-notion-border overflow-hidden mb-6" style={{ borderLeftColor: '#0F7B6C', borderLeftWidth: '3px' }}>
        <div className="px-5 py-3 bg-notion-bg-secondary border-b border-notion-border">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold text-white px-2 py-0.5 rounded" style={{ background: '#0F7B6C' }}>
              [FRANQUIA]_Painel de Growth
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded border" style={{ color: '#0F7B6C', background: '#ECFDF5', borderColor: '#A7F3D0' }}>
              CRM enriquecido
            </span>
          </div>
          <p className="text-[12px] font-medium mt-1.5" style={{ color: '#0F7B6C' }}>
            Dados comerciais e de estágio — desde fev/2026
          </p>
        </div>
        <div className="px-5 py-4 bg-notion-bg-primary space-y-4">
          <div className="flex items-center gap-4 text-[12px] text-notion-text-secondary flex-wrap">
            <span>Aba: <code className="font-mono text-[12px] bg-notion-bg-secondary border border-notion-border px-1.5 py-0.5 rounded">BASE_CRM</code></span>
            <span className="text-notion-text-tertiary">·</span>
            <span>Disponível desde <strong>01/02/2026</strong></span>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-notion-text-tertiary mb-2">
              Colunas disponíveis
            </p>
            <div className="flex flex-wrap gap-1.5">
              {CRM_COLS.map((c) => (
                <span key={c} className="text-[11px] font-mono bg-notion-bg-secondary border border-notion-border px-1.5 py-0.5 rounded text-notion-text-secondary">
                  {c}
                </span>
              ))}
            </div>
          </div>
          <Callout type="info">
            Subconjunto enriquecido da fonte primária. Estágio, Status Pipeline, Motivo de perda e
            Valor são preenchidos pelo time comercial e <strong>nunca sobrescritos</strong> pelo sync automático.
          </Callout>
        </div>
      </div>

      <H3>Campos exclusivos do CRM</H3>
      <div className="overflow-x-auto rounded-lg border border-notion-border mb-6">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-notion-bg-secondary border-b border-notion-border">
              {['Campo', 'Quem preenche', 'Descrição'].map((h) => (
                <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold text-notion-text-secondary uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { campo: 'Estágio',          quem: 'Sistema (auto)',   desc: 'LEAD, PRÉ-MQL, MQL, MQL RECUSADO, LEAD PERDIDO ou estágios comerciais' },
              { campo: 'Status Pipeline',  quem: 'Time comercial',   desc: 'Em aberto / Perdido / Ganho' },
              { campo: 'Motivo de perda',  quem: 'Time comercial',   desc: 'Razão de descarte quando Status = Perdido' },
              { campo: 'Valor',            quem: 'Time comercial',   desc: 'Valor do contrato em reais' },
              { campo: 'Foco Captação',    quem: 'Sistema (auto)',   desc: 'CAPTAÇÃO MEIO / CAPTAÇÃO FUNDO / ESPECIAL' },
              { campo: 'ID Lead',          quem: 'Sistema (auto)',   desc: 'Hash único por email — estável entre sincronizações' },
            ].map((row) => (
              <tr key={row.campo} className="border-b border-notion-border last:border-0 hover:bg-notion-bg-secondary/50 transition-colors">
                <td className="px-4 py-2.5">
                  <code className="font-mono text-[12px] text-notion-text-primary bg-notion-bg-secondary border border-notion-border px-1.5 py-0.5 rounded">{row.campo}</code>
                </td>
                <td className="px-4 py-2.5 text-[13px] text-notion-text-secondary">{row.quem}</td>
                <td className="px-4 py-2.5 text-[13px] text-notion-text-secondary">{row.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <H2 id="relacao">Relação entre as fontes</H2>

      <p className="text-[14px] text-notion-text-secondary leading-relaxed mb-4">
        A relação é de <strong>subconjunto</strong>: todo lead no CRM enriquecido existe na fonte
        primária, mas nem todo lead da fonte primária está no CRM (apenas os que passaram pelo
        processo de sync e qualificação).
      </p>

      <div className="rounded-lg border border-notion-border bg-notion-bg-secondary p-4 font-mono text-[13px] text-notion-text-secondary mb-6">
        <p className="text-notion-text-tertiary"># Regra de contenção</p>
        <p className="mt-1">CRM enriquecido (BASE_CRM) ⊆ Fonte primária (Leads Franquia)</p>
        <p className="text-notion-text-tertiary mt-2"># Chave de junção</p>
        <p>Leads Be Honest.Email = BASE_CRM.Email</p>
      </div>

      <NavCards
        cards={[
          { title: 'Regras de ID',       description: 'Como o ID é atribuído e por que um email sempre terá o mesmo ID.',   to: '/docs/regras-id'     },
          { title: 'Páginas & Canal',    description: 'Como a URL da conversão determina o campo Foco Captação.',            to: '/docs/paginas-canal' },
          { title: 'Sincronização',      description: 'O processo completo que mantém as duas fontes atualizadas.',          to: '/docs/sincronizacao' },
        ]}
      />
    </PageShell>
  );
}
