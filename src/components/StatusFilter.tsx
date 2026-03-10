export type StatusFilterValue = 'all' | 'ACTIVE' | 'PAUSED' | 'ARCHIVED';

const OPTIONS: { label: string; value: StatusFilterValue }[] = [
  { label: 'Todos', value: 'all' },
  { label: 'Ativos', value: 'ACTIVE' },
  { label: 'Pausados', value: 'PAUSED' },
  { label: 'Arquivados', value: 'ARCHIVED' },
];

interface StatusFilterProps {
  value: StatusFilterValue;
  onChange: (v: StatusFilterValue) => void;
}

export function StatusFilter({ value, onChange }: StatusFilterProps) {
  return (
    <div className="flex items-center gap-0.5 bg-notion-bg-secondary border border-notion-border rounded p-0.5">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`text-xs px-2.5 py-1 rounded transition-colors duration-[120ms] ${
            value === opt.value
              ? 'bg-notion-bg-primary text-notion-text-primary shadow-sm'
              : 'text-notion-text-tertiary hover:text-notion-text-secondary'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function matchesStatusFilter(effectiveStatus: string, filter: StatusFilterValue): boolean {
  if (filter === 'all') return true;
  if (filter === 'ACTIVE') return effectiveStatus === 'ACTIVE';
  if (filter === 'PAUSED') return effectiveStatus.includes('PAUSED');
  if (filter === 'ARCHIVED') return effectiveStatus === 'ARCHIVED' || effectiveStatus === 'DELETED';
  return true;
}
