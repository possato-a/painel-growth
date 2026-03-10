import { useState } from 'react';
import { ChevronDown, Calendar } from 'lucide-react';
import { DATE_PRESET_LABELS } from '@/lib/formatters';
import type { DatePreset, DateRange, DateCustom } from '@/types/meta';

const DATE_PRESETS: DatePreset[] = [
  'today',
  'last_7d',
  'last_14d',
  'last_30d',
  'this_month',
  'last_month',
];

function isCustom(range: DateRange): range is DateCustom {
  return typeof range === 'object';
}

function rangeLabel(range: DateRange): string {
  if (!isCustom(range)) return DATE_PRESET_LABELS[range];
  const fmt = (d: string) => d.split('-').reverse().join('/');
  return `${fmt(range.since)} – ${fmt(range.until)}`;
}

const today = new Date().toISOString().split('T')[0];

interface DateRangeSelectorProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

export function DateRangeSelector({ value, onChange }: DateRangeSelectorProps) {
  const [open, setOpen] = useState(false);
  const [since, setSince] = useState(isCustom(value) ? value.since : '');
  const [until, setUntil] = useState(isCustom(value) ? value.until : '');

  function handleOpen() {
    if (!open && isCustom(value)) {
      setSince(value.since);
      setUntil(value.until);
    }
    setOpen((v) => !v);
  }

  function handlePreset(preset: DatePreset) {
    onChange(preset);
    setOpen(false);
  }

  function handleApply() {
    if (since && until && since <= until) {
      onChange({ since, until });
      setOpen(false);
    }
  }

  const canApply = Boolean(since && until && since <= until);

  return (
    <div className="relative">
      <button
        onClick={handleOpen}
        className="flex items-center gap-2 text-sm text-notion-text-primary bg-notion-bg-primary border border-notion-border px-3 py-1.5 rounded hover:bg-notion-bg-tertiary transition-colors duration-[120ms]"
      >
        {isCustom(value) && <Calendar size={12} className="text-notion-text-secondary flex-shrink-0" />}
        <span className="whitespace-nowrap">{rangeLabel(value)}</span>
        <ChevronDown
          size={14}
          className={`text-notion-text-secondary flex-shrink-0 transition-transform duration-[120ms] ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-20 bg-notion-bg-primary border border-notion-border rounded shadow-notion-lg py-1 min-w-[200px]">
            {/* Presets */}
            {DATE_PRESETS.map((preset) => (
              <button
                key={preset}
                onClick={() => handlePreset(preset)}
                className={`w-full text-left px-3 py-1.5 text-sm transition-colors duration-[60ms] ${
                  !isCustom(value) && preset === value
                    ? 'text-notion-primary bg-notion-primary-light'
                    : 'text-notion-text-primary hover:bg-notion-bg-secondary'
                }`}
              >
                {DATE_PRESET_LABELS[preset]}
              </button>
            ))}

            {/* Custom range section */}
            <div className="border-t border-notion-border mt-1 pt-2 px-3 pb-2 space-y-2">
              <p className="flex items-center gap-1.5 text-[11px] font-medium text-notion-text-tertiary uppercase tracking-wide">
                <Calendar size={10} />
                Personalizado
              </p>
              <div className="space-y-1.5">
                <div>
                  <label className="text-[11px] text-notion-text-tertiary">De</label>
                  <input
                    type="date"
                    value={since}
                    max={until || today}
                    onChange={(e) => setSince(e.target.value)}
                    className="w-full mt-0.5 text-xs bg-notion-bg-secondary border border-notion-border rounded px-2 py-1 text-notion-text-primary focus:outline-none focus:border-notion-primary"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-notion-text-tertiary">Até</label>
                  <input
                    type="date"
                    value={until}
                    min={since || undefined}
                    max={today}
                    onChange={(e) => setUntil(e.target.value)}
                    className="w-full mt-0.5 text-xs bg-notion-bg-secondary border border-notion-border rounded px-2 py-1 text-notion-text-primary focus:outline-none focus:border-notion-primary"
                  />
                </div>
              </div>
              <button
                onClick={handleApply}
                disabled={!canApply}
                className="w-full text-xs py-1.5 rounded bg-notion-primary text-white font-medium transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Aplicar período
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
