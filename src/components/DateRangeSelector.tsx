import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { DATE_PRESET_LABELS } from '@/lib/formatters';
import type { DatePreset } from '@/types/meta';

const DATE_PRESETS: DatePreset[] = [
  'today',
  'last_7d',
  'last_14d',
  'last_30d',
  'this_month',
  'last_month',
];

interface DateRangeSelectorProps {
  value: DatePreset;
  onChange: (preset: DatePreset) => void;
}

export function DateRangeSelector({ value, onChange }: DateRangeSelectorProps) {
  const [open, setOpen] = useState(false);

  function handleSelect(preset: DatePreset) {
    onChange(preset);
    setOpen(false);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 text-sm text-notion-text-primary bg-notion-bg-primary border border-notion-border px-3 py-1.5 rounded hover:bg-notion-bg-tertiary transition-colors duration-[120ms]"
      >
        <span>{DATE_PRESET_LABELS[value]}</span>
        <ChevronDown
          size={14}
          className={`text-notion-text-secondary transition-transform duration-[120ms] ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full mt-1 z-20 bg-notion-bg-primary border border-notion-border rounded shadow-notion-lg py-1 min-w-[160px]">
            {DATE_PRESETS.map((preset) => (
              <button
                key={preset}
                onClick={() => handleSelect(preset)}
                className={`w-full text-left px-3 py-1.5 text-sm transition-colors duration-[60ms] ${
                  preset === value
                    ? 'text-notion-primary bg-notion-primary-light'
                    : 'text-notion-text-primary hover:bg-notion-bg-secondary'
                }`}
              >
                {DATE_PRESET_LABELS[preset]}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
