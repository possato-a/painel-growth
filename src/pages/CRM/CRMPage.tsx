import { useState, useMemo, useRef } from 'react';
import {
  Users, RefreshCw, Search, ChevronDown, ChevronUp,
  Check, X, Pencil, Loader2, AlertCircle,
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
      <div className="flex items-center gap-1">
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
      onClick={startEdit}
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
      const av = a[sortKey] ?? '';
      const bv = b[sortKey] ?? '';
      const cmp = String(av).localeCompare(String(bv), 'pt-BR', { numeric: true });
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return list;
  }, [leads, search, filterStage, filterFoco, filterStatus, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function toggleSort(key: keyof CRMLead) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
    setPage(1);
  }

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
              Histórico de Leads
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
              placeholder="Buscar por nome, email ou ID…"
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
              <table className="w-full border-collapse text-[12px]" style={{ minWidth: 1100 }}>
                <thead>
                  <tr className="border-b border-notion-border bg-notion-bg-secondary/50">
                    {([
                      { key: 'leadId',         label: 'ID',           w: 60 },
                      { key: 'data',           label: 'Data',         w: 80 },
                      { key: 'nome',           label: 'Nome',         w: 160 },
                      { key: 'email',          label: 'Email',        w: 180 },
                      { key: 'cidade',         label: 'Cidade/UF',    w: 120 },
                      { key: 'canalTipo',      label: 'Canal',        w: 140 },
                      { key: 'focoCaptacao',   label: 'Foco',         w: 110 },
                      { key: 'estagio',        label: 'Estágio',      w: 140 },
                      { key: 'disponibilidade',label: 'Investimento', w: 110 },
                      { key: 'statusPipeline', label: 'Pipeline',     w: 100 },
                      { key: 'motivoPerda',    label: 'Motivo Perda', w: 120 },
                      { key: 'valor',          label: 'Valor',        w: 80  },
                    ] as { key: keyof CRMLead; label: string; w: number }[]).map(col => (
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
                      <td colSpan={12} className="py-16 text-center text-[13px] text-notion-text-tertiary">
                        Nenhum lead encontrado com os filtros aplicados.
                      </td>
                    </tr>
                  ) : paginated.map(lead => (
                    <tr
                      key={lead.rowId}
                      className="border-b border-notion-border hover:bg-notion-bg-secondary transition-colors duration-[60ms] group"
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
                      {/* Nome */}
                      <td className="px-3 py-2 font-medium text-notion-text-primary max-w-[160px] truncate">{lead.nome}</td>
                      {/* Email */}
                      <td className="px-3 py-2 text-notion-text-secondary max-w-[180px] truncate">{lead.email}</td>
                      {/* Cidade */}
                      <td className="px-3 py-2 text-notion-text-secondary whitespace-nowrap">
                        {lead.cidade}{lead.estado ? `, ${lead.estado}` : ''}
                      </td>
                      {/* Canal */}
                      <td className="px-3 py-2 text-notion-text-secondary whitespace-nowrap">{lead.canalTipo}</td>
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
                      <td className="px-3 py-2 text-notion-text-secondary whitespace-nowrap">{lead.disponibilidade || '—'}</td>
                      {/* Status Pipeline (editable) */}
                      <td className="px-3 py-2">
                        <EditableCell
                          rowId={lead.rowId}
                          field="statusPipeline"
                          value={lead.statusPipeline}
                          options={STATUS_PIPELINE_OPTIONS}
                          placeholder="Pipeline"
                        />
                      </td>
                      {/* Motivo Perda (editable) */}
                      <td className="px-3 py-2">
                        <EditableCell
                          rowId={lead.rowId}
                          field="motivoPerda"
                          value={lead.motivoPerda}
                          placeholder="Motivo"
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
    </div>
  );
}
