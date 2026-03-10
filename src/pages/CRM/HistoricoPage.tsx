import { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp, Loader2, AlertCircle } from 'lucide-react';
import { useLeadsHistory, type HistoryLead } from '@/hooks/useCRM';
import { cn } from '@/lib/cn';

const MQL_CONFIG: Record<string, { color: string; bg: string }> = {
  'MQL':          { color: '#0F7B6C', bg: '#ECFDF5' },
  'PRÉ-MQL':      { color: '#9333EA', bg: '#F5F3FF' },
  'LEAD':         { color: '#2383E2', bg: '#EBF4FF' },
  'MQL RECUSADO': { color: '#D97706', bg: '#FFFBEB' },
  'LEAD PERDIDO': { color: '#E03E3E', bg: '#FFF5F5' },
};

function MqlBadge({ status }: { status: string }) {
  const cfg = MQL_CONFIG[status] || { color: '#6B7280', bg: '#F3F4F6' };
  return (
    <span className="inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded whitespace-nowrap"
      style={{ background: cfg.bg, color: cfg.color }}>
      {status || '—'}
    </span>
  );
}

function FilterSelect({ label, value, options, onChange }: {
  label: string; value: string; options: { value: string; label: string }[]; onChange: (v: string) => void;
}) {
  return (
    <select
      className="text-[12px] border border-notion-border rounded px-2.5 py-1.5 bg-notion-bg-primary text-notion-text-secondary focus:outline-none focus:ring-1 focus:ring-notion-primary"
      value={value}
      onChange={e => onChange(e.target.value)}
    >
      <option value="">{label}: Todos</option>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

const COLUMNS: { key: keyof HistoryLead; label: string; w: number }[] = [
  { key: 'data',            label: 'Data',           w: 80  },
  { key: 'hora',            label: 'Hora',           w: 60  },
  { key: 'nome',            label: 'Nome',           w: 160 },
  { key: 'email',           label: 'Email',          w: 190 },
  { key: 'celular',         label: 'Celular',        w: 130 },
  { key: 'cidade',          label: 'Cidade',         w: 110 },
  { key: 'estado',          label: 'UF',             w: 50  },
  { key: 'disponibilidade', label: 'Investimento',   w: 120 },
  { key: 'mqStatus',        label: 'Status',         w: 110 },
  { key: 'page',            label: 'Página',         w: 160 },
  { key: 'source',          label: 'Source',         w: 90  },
  { key: 'campaign',        label: 'Campanha',       w: 150 },
];

export function HistoricoPage() {
  const { data: store, isLoading, isError, error } = useLeadsHistory();

  const [search,     setSearch]     = useState('');
  const [filterMql,  setFilterMql]  = useState('');
  const [sortKey,    setSortKey]    = useState<keyof HistoryLead>('data');
  const [sortDir,    setSortDir]    = useState<'asc' | 'desc'>('desc');
  const [page,       setPage]       = useState(1);
  const PAGE_SIZE = 50;

  const leads = store?.leads ?? [];

  const mqlOptions = useMemo(() => {
    const uniq = [...new Set(leads.map(l => l.mqStatus))].filter(Boolean).sort();
    return uniq.map(s => ({ value: s, label: s }));
  }, [leads]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    let list = leads;
    if (q) list = list.filter(l =>
      l.nome.toLowerCase().includes(q) ||
      l.email.toLowerCase().includes(q) ||
      l.cidade.toLowerCase().includes(q)
    );
    if (filterMql) list = list.filter(l => l.mqStatus === filterMql);

    list = [...list].sort((a, b) => {
      const cmp = String(a[sortKey] ?? '').localeCompare(String(b[sortKey] ?? ''), 'pt-BR', { numeric: true });
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [leads, search, filterMql, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function toggleSort(key: keyof HistoryLead) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
    setPage(1);
  }

  function SortIcon({ col }: { col: keyof HistoryLead }) {
    if (sortKey !== col) return <ChevronDown size={10} className="opacity-20" />;
    return sortDir === 'asc' ? <ChevronUp size={11} className="text-notion-primary" /> : <ChevronDown size={11} className="text-notion-primary" />;
  }

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-10 bg-notion-bg-secondary border-b border-notion-border px-8 py-4">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-notion-text-primary tracking-tight">Histórico de Leads</h1>
          <span className="text-xs font-medium text-notion-text-secondary bg-notion-bg-primary border border-notion-border px-2.5 py-1 rounded-sm">
            Leads Be Honest · desde 04/07/2025
          </span>
          {!isLoading && (
            <span className="text-[11px] text-notion-text-tertiary ml-1">
              {(store?.totalLeads ?? 0).toLocaleString('pt-BR')} registros
            </span>
          )}
        </div>
      </div>

      <div className="px-8 py-6 space-y-4">
        {isError && (
          <div className="flex items-center gap-2 text-[13px] text-red-600 bg-red-50 border border-red-200 rounded p-3">
            <AlertCircle size={14} className="flex-shrink-0" />
            {String(error)}
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-notion-text-tertiary pointer-events-none" />
            <input
              className="w-full text-[12px] border border-notion-border rounded pl-8 pr-3 py-1.5 bg-notion-bg-primary text-notion-text-primary placeholder:text-notion-text-tertiary focus:outline-none focus:ring-1 focus:ring-notion-primary"
              placeholder="Buscar por nome, email ou cidade…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <FilterSelect
            label="Status"
            value={filterMql}
            options={mqlOptions}
            onChange={v => { setFilterMql(v); setPage(1); }}
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
              Carregando histórico…
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[12px]" style={{ minWidth: 1200 }}>
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
                        Nenhum lead encontrado.
                      </td>
                    </tr>
                  ) : paginated.map((lead, i) => (
                    <tr key={i} className="border-b border-notion-border hover:bg-notion-bg-secondary transition-colors duration-[60ms]">
                      <td className="px-3 py-2 text-notion-text-secondary whitespace-nowrap">{lead.data}</td>
                      <td className="px-3 py-2 text-notion-text-secondary">{lead.hora || '—'}</td>
                      <td className="px-3 py-2 font-medium text-notion-text-primary max-w-[160px] truncate">{lead.nome}</td>
                      <td className="px-3 py-2 text-notion-text-secondary max-w-[190px] truncate">{lead.email}</td>
                      <td className="px-3 py-2 text-notion-text-secondary">{lead.celular}</td>
                      <td className="px-3 py-2 text-notion-text-secondary">{lead.cidade}</td>
                      <td className="px-3 py-2 text-notion-text-secondary">{lead.estado}</td>
                      <td className="px-3 py-2 text-notion-text-secondary text-[11px]">{lead.disponibilidade || '—'}</td>
                      <td className="px-3 py-2"><MqlBadge status={lead.mqStatus} /></td>
                      <td className="px-3 py-2 text-notion-text-secondary max-w-[160px] truncate text-[11px] font-mono">{lead.page}</td>
                      <td className="px-3 py-2 text-notion-text-secondary text-[11px]">{lead.source}</td>
                      <td className="px-3 py-2 text-notion-text-secondary max-w-[150px] truncate text-[11px]">{lead.campaign}</td>
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
            <span>Página {page} de {totalPages} ({filtered.length.toLocaleString('pt-BR')} registros)</span>
            <div className="flex items-center gap-1">
              <button className="px-2.5 py-1 rounded border border-notion-border hover:bg-notion-bg-tertiary disabled:opacity-40 disabled:cursor-not-allowed"
                onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>←</button>
              {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                const p = page <= 4 ? i + 1 : page + i - 3;
                if (p < 1 || p > totalPages) return null;
                return (
                  <button key={p}
                    className={cn('w-7 h-7 rounded border text-[11px]', p === page ? 'bg-notion-primary text-white border-notion-primary' : 'border-notion-border hover:bg-notion-bg-tertiary')}
                    onClick={() => setPage(p)}>{p}</button>
                );
              })}
              <button className="px-2.5 py-1 rounded border border-notion-border hover:bg-notion-bg-tertiary disabled:opacity-40 disabled:cursor-not-allowed"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>→</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
