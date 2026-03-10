import { useState, useMemo, useRef, useCallback } from 'react';
import {
  Users, RefreshCw, Search, ChevronDown, ChevronUp,
  Check, X, Pencil, Loader2, AlertCircle, XCircle,
  Globe, Phone, Mail, MapPin, Calendar, Clock,
} from 'lucide-react';
import { useCRM, usePatchLead, useSyncCRM, type CRMLead } from '@/hooks/useCRM';
import { cn } from '@/lib/cn';

// ── Stage config ───────────────────────────────────────────────
const STAGE_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  'LEAD':                          { color: '#2383E2', bg: '#EBF4FF', label: 'LEAD' },
  'PRÉ-MQL':                       { color: '#9333EA', bg: '#F5F3FF', label: 'PRÉ-MQL' },
  'MQL':                           { color: '#0F7B6C', bg: '#ECFDF5', label: 'MQL' },
  'MQL RECUSADO':                  { color: '#D97706', bg: '#FFFBEB', label: 'MQL RECUSADO' },
  'LEAD PERDIDO':                  { color: '#E03E3E', bg: '#FFF5F5', label: 'LEAD PERDIDO' },
  'CONEXÃO':                       { color: '#0F7B6C', bg: '#ECFDF5', label: 'CONEXÃO' },
  'REUNIÃO FINANCEIRA':            { color: '#0F7B6C', bg: '#ECFDF5', label: 'REUNIÃO FINANCEIRA' },
  'SQL':                           { color: '#0F7B6C', bg: '#ECFDF5', label: 'SQL' },
  'APRESENTAÇÃO MODELO AGENDADA':  { color: '#0F7B6C', bg: '#ECFDF5', label: 'APRESENTAÇÃO' },
  'REUNIÃO MODELO REALIZADA':      { color: '#0F7B6C', bg: '#ECFDF5', label: 'RN. MODELO' },
  'REUNIÃO COM FUNDADOR':          { color: '#0F7B6C', bg: '#ECFDF5', label: 'RN. FUNDADOR' },
};

const FOCO_CONFIG: Record<string, { color: string; bg: string }> = {
  'CAPTAÇÃO MEIO':  { color: '#9333EA', bg: '#F5F3FF' },
  'CAPTAÇÃO FUNDO': { color: '#0F7B6C', bg: '#ECFDF5' },
  'ESPECIAL':       { color: '#D97706', bg: '#FFFBEB' },
};

const STATUS_PIPELINE_OPTIONS = ['', 'Em aberto', 'Perdido'];

// ── Sub-components ─────────────────────────────────────────────
function StageBadge({ stage }: { stage: string }) {
  const cfg = STAGE_CONFIG[stage] || { color: '#6B7280', bg: '#F3F4F6', label: stage };
  return (
    <span
      className="inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded whitespace-nowrap"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      {cfg.label}
    </span>
  );
}

function FocoBadge({ foco }: { foco: string }) {
  const cfg = FOCO_CONFIG[foco] || { color: '#6B7280', bg: '#F3F4F6' };
  return (
    <span
      className="inline-flex items-center text-[10px] font-semibold px-1.5 py-0.5 rounded whitespace-nowrap"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      {foco}
    </span>
  );
}

function StatCard({ label, value, sub, color }: { label: string; value: number; sub?: string; color: string }) {
  return (
    <div className="bg-notion-bg-primary rounded-lg shadow-notion-md px-5 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-notion-text-tertiary mb-1">{label}</p>
      <p className="text-2xl font-bold" style={{ color }}>{value.toLocaleString('pt-BR')}</p>
      {sub && <p className="text-[11px] text-notion-text-tertiary mt-0.5">{sub}</p>}
    </div>
  );
}

// Inline editable cell for commercial fields
function EditableCell({
  rowId, field, value, options, placeholder, renderValue,
}: {
  rowId: string;
  field: 'estagio' | 'statusPipeline' | 'motivoPerda' | 'valor';
  value: string;
  options?: string[];
  placeholder?: string;
  renderValue?: (v: string) => React.ReactNode;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const patch = usePatchLead();
  const inputRef = useRef<HTMLInputElement | HTMLSelectElement>(null);

  function startEdit() {
    setDraft(value);
    setEditing(true);
    setTimeout(() => (inputRef.current as HTMLElement)?.focus(), 0);
  }

  function save() {
    if (draft === value) { setEditing(false); return; }
    patch.mutate({ rowId, fields: { [field]: draft } });
    setEditing(false);
  }

  function cancel() { setDraft(value); setEditing(false); }

  if (editing) {
    return (
      <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
        {options ? (
          <select
            ref={inputRef as React.RefObject<HTMLSelectElement>}
            className="text-[11px] border border-notion-border rounded px-1.5 py-0.5 bg-notion-bg-primary text-notion-text-primary focus:outline-none focus:ring-1 focus:ring-notion-primary"
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') cancel(); }}
          >
            {options.map(o => <option key={o} value={o}>{o || '—'}</option>)}
          </select>
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            className="text-[11px] border border-notion-border rounded px-1.5 py-0.5 bg-notion-bg-primary text-notion-text-primary w-28 focus:outline-none focus:ring-1 focus:ring-notion-primary"
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') cancel(); }}
            placeholder={placeholder}
          />
        )}
        <button onClick={save} className="text-notion-primary hover:text-notion-primary/80">
          <Check size={12} />
        </button>
        <button onClick={cancel} className="text-notion-text-tertiary hover:text-notion-text-secondary">
          <X size={12} />
        </button>
      </div>
    );
  }

  return (
    <button
      className="group flex items-center gap-1 text-[11px] text-notion-text-primary hover:text-notion-primary transition-colors"
      onClick={e => { e.stopPropagation(); startEdit(); }}
    >
      {renderValue && value
        ? renderValue(value)
        : <span className={value ? '' : 'text-notion-text-tertiary italic'}>{value || placeholder || '—'}</span>}
      {patch.isPending ? (
        <Loader2 size={10} className="animate-spin text-notion-text-tertiary" />
      ) : (
        <Pencil size={10} className="opacity-0 group-hover:opacity-50 text-notion-text-tertiary flex-shrink-0" />
      )}
    </button>
  );
}

// Sidebar editable field (bigger, more comfortable)
function SidebarEditField({
  rowId, field, value, options, label, placeholder,
}: {
  rowId: string;
  field: 'estagio' | 'statusPipeline' | 'motivoPerda' | 'valor';
  value: string;
  options?: string[];
  label: string;
  placeholder?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const patch = usePatchLead();
  const inputRef = useRef<HTMLInputElement | HTMLSelectElement>(null);

  function startEdit() {
    setDraft(value);
    setEditing(true);
    setTimeout(() => (inputRef.current as HTMLElement)?.focus(), 0);
  }

  function save() {
    if (draft === value) { setEditing(false); return; }
    patch.mutate({ rowId, fields: { [field]: draft } });
    setEditing(false);
  }

  function cancel() { setDraft(value); setEditing(false); }

  return (
    <div>
      <p className="text-[11px] font-medium text-notion-text-tertiary uppercase tracking-wider mb-1">{label}</p>
      {editing ? (
        <div className="flex items-center gap-1.5">
          {options ? (
            <select
              ref={inputRef as React.RefObject<HTMLSelectElement>}
              className="flex-1 text-[13px] border border-notion-border rounded px-2.5 py-1.5 bg-notion-bg-primary text-notion-text-primary focus:outline-none focus:ring-1 focus:ring-notion-primary"
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') cancel(); }}
            >
              {options.map(o => <option key={o} value={o}>{o || '—'}</option>)}
            </select>
          ) : (
            <input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              className="flex-1 text-[13px] border border-notion-border rounded px-2.5 py-1.5 bg-notion-bg-primary text-notion-text-primary focus:outline-none focus:ring-1 focus:ring-notion-primary"
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') cancel(); }}
              placeholder={placeholder}
            />
          )}
          <button onClick={save} className="p-1.5 rounded bg-notion-primary text-white hover:opacity-90">
            <Check size={13} />
          </button>
          <button onClick={cancel} className="p-1.5 rounded border border-notion-border text-notion-text-tertiary hover:text-notion-text-secondary">
            <X size={13} />
          </button>
        </div>
      ) : (
        <button
          className="w-full flex items-center justify-between text-[13px] text-notion-text-primary border border-notion-border rounded px-2.5 py-1.5 hover:bg-notion-bg-tertiary transition-colors group"
          onClick={startEdit}
        >
          <span className={value ? '' : 'text-notion-text-tertiary italic'}>
            {field === 'estagio' && value ? <StageBadge stage={value} /> : (value || placeholder || '—')}
          </span>
          {patch.isPending ? (
            <Loader2 size={12} className="animate-spin text-notion-text-tertiary" />
          ) : (
            <Pencil size={12} className="opacity-0 group-hover:opacity-50 text-notion-text-tertiary" />
          )}
        </button>
      )}
    </div>
  );
}

// ── Lead Detail Sidebar ─────────────────────────────────────────
function LeadSidebar({
  lead,
  allLeads,
  onClose,
}: {
  lead: CRMLead;
  allLeads: CRMLead[];
  onClose: () => void;
}) {
  // Find all conversions for this lead (same leadId)
  const conversions = useMemo(
    () => allLeads
      .filter(l => l.leadId === lead.leadId)
      .sort((a, b) => {
        const toDate = (v: string) => {
          const p = v.split('/');
          return p.length === 3 ? `${p[2]}-${p[1].padStart(2,'0')}-${p[0].padStart(2,'0')}` : v;
        };
        return toDate(a.data).localeCompare(toDate(b.data));
      }),
    [allLeads, lead.leadId]
  );

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 z-30" onClick={onClose} />
      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-[440px] max-w-full bg-notion-bg-primary border-l border-notion-border shadow-2xl z-40 flex flex-col animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-notion-border bg-notion-bg-secondary/50">
          <div>
            <p className="text-base font-bold text-notion-text-primary">{lead.nome}</p>
            <p className="text-[11px] text-notion-text-tertiary font-mono">{lead.leadId} · {conversions.length} conversão(ões)</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-notion-bg-tertiary text-notion-text-tertiary hover:text-notion-text-primary">
            <XCircle size={18} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* Contact info */}
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-notion-text-tertiary">Contato</p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-[13px]">
                <Mail size={13} className="text-notion-text-tertiary flex-shrink-0" />
                <span className="text-notion-text-primary">{lead.email}</span>
              </div>
              {lead.celular && (
                <div className="flex items-center gap-2 text-[13px]">
                  <Phone size={13} className="text-notion-text-tertiary flex-shrink-0" />
                  <span className="text-notion-text-primary">{lead.celular}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-[13px]">
                <MapPin size={13} className="text-notion-text-tertiary flex-shrink-0" />
                <span className="text-notion-text-primary">{lead.cidade}{lead.estado ? `, ${lead.estado}` : ''}</span>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-notion-text-tertiary">Detalhes</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[12px]">
              <div>
                <span className="text-notion-text-tertiary">Investimento</span>
                <p className="text-notion-text-primary font-medium">{lead.disponibilidade || '—'}</p>
              </div>
              <div>
                <span className="text-notion-text-tertiary">Foco</span>
                <p className="mt-0.5"><FocoBadge foco={lead.focoCaptacao} /></p>
              </div>
              <div>
                <span className="text-notion-text-tertiary">Canal</span>
                <p className="text-notion-text-primary">{lead.canalTipo || '—'}</p>
              </div>
              <div>
                <span className="text-notion-text-tertiary">Source</span>
                <p className="text-notion-text-primary">{lead.source || '—'}</p>
              </div>
              <div>
                <span className="text-notion-text-tertiary">Campanha</span>
                <p className="text-notion-text-primary truncate">{lead.campaign || '—'}</p>
              </div>
              <div>
                <span className="text-notion-text-tertiary">Conjunto</span>
                <p className="text-notion-text-primary truncate">{lead.conjunto || '—'}</p>
              </div>
              <div className="col-span-2">
                <span className="text-notion-text-tertiary">Criativo</span>
                <p className="text-notion-text-primary truncate">{lead.criativo || '—'}</p>
              </div>
            </div>
          </div>

          {/* Editable fields */}
          <div className="space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-notion-text-tertiary">Campos editáveis</p>
            <SidebarEditField
              rowId={lead.rowId}
              field="estagio"
              value={lead.estagio}
              options={Object.keys(STAGE_CONFIG)}
              label="Estágio"
            />
            <SidebarEditField
              rowId={lead.rowId}
              field="statusPipeline"
              value={lead.statusPipeline}
              options={STATUS_PIPELINE_OPTIONS}
              label="Status Pipeline"
              placeholder="Selecionar"
            />
            <SidebarEditField
              rowId={lead.rowId}
              field="motivoPerda"
              value={lead.motivoPerda}
              label="Motivo de Perda"
              placeholder="Descrever motivo"
            />
            <SidebarEditField
              rowId={lead.rowId}
              field="valor"
              value={lead.valor}
              label="Valor"
              placeholder="R$"
            />
          </div>

          {/* Conversion history */}
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-notion-text-tertiary">
              Histórico de conversões ({conversions.length})
            </p>
            <div className="space-y-2">
              {conversions.map((conv, i) => (
                <div
                  key={conv.rowId}
                  className={cn(
                    'border rounded-lg p-3 text-[12px] space-y-1.5',
                    conv.rowId === lead.rowId
                      ? 'border-notion-primary bg-[#EBF4FF]/50'
                      : 'border-notion-border'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-notion-text-primary">
                      Conversão {i + 1}
                    </span>
                    <span className="text-notion-text-tertiary">
                      {conv.data} {conv.hora ? `· ${conv.hora}` : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px]">
                    <Globe size={11} className="text-notion-text-tertiary flex-shrink-0" />
                    <span className="text-notion-text-secondary font-mono truncate">{conv.page || '—'}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <FocoBadge foco={conv.focoCaptacao} />
                    <StageBadge stage={conv.estagio} />
                  </div>
                  {conv.campaign && (
                    <p className="text-[11px] text-notion-text-tertiary truncate">
                      Campanha: {conv.campaign}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Filter Select ──────────────────────────────────────────────
function FilterSelect({
  label, value, options, onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <select
      className="text-[12px] border border-notion-border rounded px-2.5 py-1.5 bg-notion-bg-primary text-notion-text-secondary focus:outline-none focus:ring-1 focus:ring-notion-primary appearance-none pr-7"
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23999\' stroke-width=\'2\'%3E%3Cpath d=\'M6 9l6 6 6-6\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}
    >
      <option value="">{label}: Todos</option>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

// ── Column defs ────────────────────────────────────────────────
const COLUMNS: { key: keyof CRMLead; label: string; w: number }[] = [
  { key: 'leadId',         label: 'ID',           w: 60  },
  { key: 'data',           label: 'Data',         w: 80  },
  { key: 'hora',           label: 'Hora',         w: 55  },
  { key: 'nome',           label: 'Nome',         w: 140 },
  { key: 'email',          label: 'Email',        w: 170 },
  { key: 'cidade',         label: 'Cidade',       w: 100 },
  { key: 'estado',         label: 'UF',           w: 40  },
  { key: 'page',           label: 'Página',       w: 140 },
  { key: 'source',         label: 'Source',       w: 70  },
  { key: 'campaign',       label: 'Campanha',     w: 130 },
  { key: 'conjunto',       label: 'Conjunto',     w: 110 },
  { key: 'criativo',       label: 'Criativo',     w: 110 },
  { key: 'canalTipo',      label: 'Canal',        w: 120 },
  { key: 'focoCaptacao',   label: 'Foco',         w: 100 },
  { key: 'estagio',        label: 'Estágio',      w: 130 },
  { key: 'disponibilidade',label: 'Investimento', w: 100 },
  { key: 'statusPipeline', label: 'Pipeline',     w: 90  },
  { key: 'motivoPerda',    label: 'Motivo',       w: 100 },
  { key: 'valor',          label: 'Valor',        w: 75  },
];

// ── Main Page ──────────────────────────────────────────────────
export function CRMPage() {
  const { data: store, isLoading, isError, error } = useCRM();
  const syncMutation = useSyncCRM();

  const [search,       setSearch]       = useState('');
  const [filterStage,  setFilterStage]  = useState('');
  const [filterFoco,   setFilterFoco]   = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortKey,      setSortKey]      = useState<keyof CRMLead>('data');
  const [sortDir,      setSortDir]      = useState<'asc' | 'desc'>('desc');
  const [page,         setPage]         = useState(1);
  const [selectedLead, setSelectedLead] = useState<CRMLead | null>(null);
  const PAGE_SIZE = 50;

  const leads = store?.leads ?? [];

  // Derived stats
  const stats = useMemo(() => {
    const total   = leads.length;
    const unique  = store?.uniqueLeads ?? 0;
    const mqls    = leads.filter(l => ['MQL','SQL','CONEXÃO','REUNIÃO FINANCEIRA','APRESENTAÇÃO MODELO AGENDADA','REUNIÃO MODELO REALIZADA','REUNIÃO COM FUNDADOR'].includes(l.estagio)).length;
    const emAberto = leads.filter(l => l.statusPipeline === 'Em aberto').length;
    const perdidos = leads.filter(l => l.statusPipeline === 'Perdido').length;
    return { total, unique, mqls, emAberto, perdidos };
  }, [leads, store]);

  // Filter + sort
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    let list = leads;

    if (q) list = list.filter(l =>
      l.nome.toLowerCase().includes(q) ||
      l.email.toLowerCase().includes(q) ||
      l.cidade.toLowerCase().includes(q) ||
      l.leadId.toLowerCase().includes(q)
    );
    if (filterStage)  list = list.filter(l => l.estagio === filterStage);
    if (filterFoco)   list = list.filter(l => l.focoCaptacao === filterFoco);
    if (filterStatus) {
      if (filterStatus === 'sem_status') list = list.filter(l => !l.statusPipeline);
      else list = list.filter(l => l.statusPipeline === filterStatus);
    }

    list = [...list].sort((a, b) => {
      const toSort = (v: unknown, key: keyof CRMLead) => {
        if (key === 'data') {
          const p = String(v ?? '').split('/');
          return p.length === 3 ? `${p[2]}-${p[1].padStart(2,'0')}-${p[0].padStart(2,'0')}` : String(v ?? '');
        }
        return String(v ?? '');
      };
      const cmp = toSort(a[sortKey], sortKey).localeCompare(toSort(b[sortKey], sortKey), 'pt-BR', { numeric: true });
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return list;
  }, [leads, search, filterStage, filterFoco, filterStatus, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSort = useCallback((key: keyof CRMLead) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
    setPage(1);
  }, [sortKey]);

  function SortIcon({ col }: { col: keyof CRMLead }) {
    if (sortKey !== col) return <ChevronDown size={10} className="opacity-20" />;
    return sortDir === 'asc' ? <ChevronUp size={11} className="text-notion-primary" /> : <ChevronDown size={11} className="text-notion-primary" />;
  }

  const lastSync = store?.lastSync
    ? new Date(store.lastSync).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
    : null;

  // Stage options for filter
  const stageOptions = useMemo(() => {
    const uniq = [...new Set(leads.map(l => l.estagio))].filter(Boolean).sort();
    return uniq.map(s => ({ value: s, label: s }));
  }, [leads]);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-notion-bg-secondary border-b border-notion-border px-8 py-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-notion-text-primary tracking-tight">CRM</h1>
            <span className="text-xs font-medium text-notion-text-secondary bg-notion-bg-primary border border-notion-border px-2.5 py-1 rounded-sm">
              Leads Be Honest · desde 01/02/2026
            </span>
            {lastSync && (
              <span className="text-[11px] text-notion-text-tertiary">
                Sync: {lastSync}
              </span>
            )}
          </div>
          <button
            className={cn(
              'flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 rounded border transition-colors',
              syncMutation.isPending
                ? 'border-notion-border text-notion-text-tertiary cursor-not-allowed'
                : 'border-notion-border text-notion-text-secondary hover:bg-notion-bg-tertiary hover:text-notion-text-primary'
            )}
            onClick={() => syncMutation.mutate()}
            disabled={syncMutation.isPending}
          >
            <RefreshCw size={12} className={syncMutation.isPending ? 'animate-spin' : ''} />
            {syncMutation.isPending ? 'Sincronizando…' : 'Sincronizar'}
          </button>
        </div>
      </div>

      <div className="px-8 py-6 space-y-5">

        {/* Error */}
        {isError && (
          <div className="flex items-center gap-2 text-[13px] text-red-600 bg-red-50 border border-red-200 rounded p-3">
            <AlertCircle size={14} className="flex-shrink-0" />
            {String(error)}
          </div>
        )}

        {/* Stats cards */}
        {!isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard label="Total de conversões" value={stats.total}  sub={`${stats.unique} leads únicos`} color="#2383E2" />
            <StatCard label="MQLs (todos estágios)" value={stats.mqls} color="#0F7B6C" />
            <StatCard label="Em aberto"  value={stats.emAberto} color="#D97706" />
            <StatCard label="Perdidos"   value={stats.perdidos} color="#E03E3E" />
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-notion-text-tertiary pointer-events-none" />
            <input
              className="w-full text-[12px] border border-notion-border rounded pl-8 pr-3 py-1.5 bg-notion-bg-primary text-notion-text-primary placeholder:text-notion-text-tertiary focus:outline-none focus:ring-1 focus:ring-notion-primary"
              placeholder="Buscar por nome, email, cidade ou ID…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>

          <FilterSelect
            label="Estágio"
            value={filterStage}
            options={stageOptions}
            onChange={v => { setFilterStage(v); setPage(1); }}
          />
          <FilterSelect
            label="Foco"
            value={filterFoco}
            options={[
              { value: 'CAPTAÇÃO MEIO',  label: 'Captação Meio' },
              { value: 'CAPTAÇÃO FUNDO', label: 'Captação Fundo' },
              { value: 'ESPECIAL',       label: 'Especial' },
            ]}
            onChange={v => { setFilterFoco(v); setPage(1); }}
          />
          <FilterSelect
            label="Status"
            value={filterStatus}
            options={[
              { value: 'Em aberto',  label: 'Em aberto' },
              { value: 'Perdido',    label: 'Perdido' },
              { value: 'sem_status', label: 'Sem status' },
            ]}
            onChange={v => { setFilterStatus(v); setPage(1); }}
          />

          <span className="text-[11px] text-notion-text-tertiary ml-auto">
            {filtered.length.toLocaleString('pt-BR')} registros
          </span>
        </div>

        {/* Table */}
        <div className="bg-notion-bg-primary rounded-lg shadow-notion-md overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-20 gap-2 text-notion-text-tertiary text-[13px]">
              <Loader2 size={16} className="animate-spin" />
              Carregando leads…
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[12px]" style={{ minWidth: 1900 }}>
                <thead>
                  <tr className="border-b border-notion-border bg-notion-bg-secondary/50">
                    {COLUMNS.map(col => (
                      <th
                        key={col.key}
                        className="px-3 py-2.5 text-left font-medium text-notion-text-secondary cursor-pointer hover:text-notion-text-primary select-none whitespace-nowrap"
                        style={{ width: col.w }}
                        onClick={() => toggleSort(col.key)}
                      >
                        <span className="flex items-center gap-1">
                          {col.label}
                          <SortIcon col={col.key} />
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan={COLUMNS.length} className="py-16 text-center text-[13px] text-notion-text-tertiary">
                        Nenhum lead encontrado com os filtros aplicados.
                      </td>
                    </tr>
                  ) : paginated.map(lead => (
                    <tr
                      key={lead.rowId}
                      className="border-b border-notion-border hover:bg-notion-bg-secondary transition-colors duration-[60ms] cursor-pointer group"
                      onClick={() => setSelectedLead(lead)}
                    >
                      {/* ID */}
                      <td className="px-3 py-2">
                        <span className="font-mono text-[11px] text-notion-text-tertiary">{lead.leadId}</span>
                        {lead.conversionNum > 1 && (
                          <span className="ml-1 text-[10px] font-medium text-[#9333EA] bg-[#F5F3FF] px-1 rounded">×{lead.conversionNum}</span>
                        )}
                      </td>
                      {/* Data */}
                      <td className="px-3 py-2 text-notion-text-secondary whitespace-nowrap">{lead.data}</td>
                      {/* Hora */}
                      <td className="px-3 py-2 text-notion-text-secondary">{lead.hora || '—'}</td>
                      {/* Nome */}
                      <td className="px-3 py-2 font-medium text-notion-text-primary max-w-[140px] truncate">{lead.nome}</td>
                      {/* Email */}
                      <td className="px-3 py-2 text-notion-text-secondary max-w-[170px] truncate">{lead.email}</td>
                      {/* Cidade */}
                      <td className="px-3 py-2 text-notion-text-secondary whitespace-nowrap">{lead.cidade || '—'}</td>
                      {/* UF */}
                      <td className="px-3 py-2 text-notion-text-secondary">{lead.estado || '—'}</td>
                      {/* Página */}
                      <td className="px-3 py-2 text-notion-text-secondary max-w-[140px] truncate text-[11px] font-mono">{lead.page || '—'}</td>
                      {/* Source */}
                      <td className="px-3 py-2 text-notion-text-secondary text-[11px]">{lead.source || '—'}</td>
                      {/* Campanha */}
                      <td className="px-3 py-2 text-notion-text-secondary max-w-[130px] truncate text-[11px]">{lead.campaign || '—'}</td>
                      {/* Conjunto */}
                      <td className="px-3 py-2 text-notion-text-secondary max-w-[110px] truncate text-[11px]">{lead.conjunto || '—'}</td>
                      {/* Criativo */}
                      <td className="px-3 py-2 text-notion-text-secondary max-w-[110px] truncate text-[11px]">{lead.criativo || '—'}</td>
                      {/* Canal */}
                      <td className="px-3 py-2 text-notion-text-secondary whitespace-nowrap text-[11px]">{lead.canalTipo}</td>
                      {/* Foco */}
                      <td className="px-3 py-2">
                        <FocoBadge foco={lead.focoCaptacao} />
                      </td>
                      {/* Estágio (editable) */}
                      <td className="px-3 py-2">
                        <EditableCell
                          rowId={lead.rowId}
                          field="estagio"
                          value={lead.estagio}
                          options={Object.keys(STAGE_CONFIG)}
                          renderValue={(v) => <StageBadge stage={v} />}
                        />
                      </td>
                      {/* Investimento */}
                      <td className="px-3 py-2 text-notion-text-secondary whitespace-nowrap text-[11px]">{lead.disponibilidade || '—'}</td>
                      {/* Status Pipeline (editable) */}
                      <td className="px-3 py-2">
                        <EditableCell
                          rowId={lead.rowId}
                          field="statusPipeline"
                          value={lead.statusPipeline}
                          options={STATUS_PIPELINE_OPTIONS}
                          placeholder="—"
                        />
                      </td>
                      {/* Motivo Perda (editable) */}
                      <td className="px-3 py-2">
                        <EditableCell
                          rowId={lead.rowId}
                          field="motivoPerda"
                          value={lead.motivoPerda}
                          placeholder="—"
                        />
                      </td>
                      {/* Valor (editable) */}
                      <td className="px-3 py-2">
                        <EditableCell
                          rowId={lead.rowId}
                          field="valor"
                          value={lead.valor}
                          placeholder="R$"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between text-[12px] text-notion-text-secondary">
            <span>
              Página {page} de {totalPages} ({filtered.length.toLocaleString('pt-BR')} registros)
            </span>
            <div className="flex items-center gap-1">
              <button
                className="px-2.5 py-1 rounded border border-notion-border hover:bg-notion-bg-tertiary disabled:opacity-40 disabled:cursor-not-allowed"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                ←
              </button>
              {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                const p = page <= 4 ? i + 1 : page + i - 3;
                if (p < 1 || p > totalPages) return null;
                return (
                  <button
                    key={p}
                    className={cn(
                      'w-7 h-7 rounded border text-[11px]',
                      p === page
                        ? 'bg-notion-primary text-white border-notion-primary'
                        : 'border-notion-border hover:bg-notion-bg-tertiary'
                    )}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                className="px-2.5 py-1 rounded border border-notion-border hover:bg-notion-bg-tertiary disabled:opacity-40 disabled:cursor-not-allowed"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                →
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Lead Detail Sidebar */}
      {selectedLead && (
        <LeadSidebar
          lead={selectedLead}
          allLeads={leads}
          onClose={() => setSelectedLead(null)}
        />
      )}
    </div>
  );
}
