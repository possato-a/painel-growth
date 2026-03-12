import { Info, AlertTriangle, CheckCircle, Lightbulb } from 'lucide-react';

export type CalloutType = 'note' | 'tip' | 'warning' | 'info';

interface CalloutProps {
  type?: CalloutType;
  title?: string;
  children: React.ReactNode;
}

const CALLOUT_CONFIG = {
  note:    { Icon: Info,          bg: '#EBF4FF', border: '#BFDBFE', color: '#2383E2', label: 'Note'    },
  tip:     { Icon: Lightbulb,     bg: '#ECFDF5', border: '#A7F3D0', color: '#0F7B6C', label: 'Tip'     },
  warning: { Icon: AlertTriangle, bg: '#FFFBEB', border: '#FDE68A', color: '#D97706', label: 'Warning' },
  info:    { Icon: Info,          bg: '#F5F3FF', border: '#DDD6FE', color: '#9333EA', label: 'Info'    },
} as const;

export function Callout({ type = 'note', title, children }: CalloutProps) {
  const { Icon, bg, border, color, label } = CALLOUT_CONFIG[type];

  return (
    <div
      className="flex items-start gap-3 px-4 py-3.5 rounded-lg my-4"
      style={{ background: bg, border: `1px solid ${border}` }}
    >
      <Icon size={15} className="flex-shrink-0 mt-0.5" style={{ color }} />
      <div className="min-w-0">
        <p className="text-[13px] font-semibold mb-0.5" style={{ color }}>
          {title ?? label}
        </p>
        <div className="text-[13px] text-notion-text-secondary leading-relaxed">{children}</div>
      </div>
    </div>
  );
}
