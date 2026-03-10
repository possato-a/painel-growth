import { cn } from '@/lib/cn';

type BadgeVariant = 'active' | 'paused' | 'archived' | 'deleted' | 'default' | 'soon';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  active: 'bg-notion-primary-light text-notion-primary',
  paused: 'bg-[#F1F1EF] text-notion-text-secondary',
  archived: 'bg-[#E3E2E0] text-[#55534E]',
  deleted: 'bg-[#FFE2DD] text-[#E03E3E]',
  default: 'bg-[#F1F1EF] text-notion-text-secondary',
  soon: 'bg-[#F1F1EF] text-notion-text-tertiary',
};

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium whitespace-nowrap',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function statusToBadgeVariant(status: string): BadgeVariant {
  switch (status?.toUpperCase()) {
    case 'ACTIVE':
      return 'active';
    case 'PAUSED':
      return 'paused';
    case 'ARCHIVED':
      return 'archived';
    case 'DELETED':
      return 'deleted';
    default:
      return 'default';
  }
}

export function statusLabel(status: string): string {
  const map: Record<string, string> = {
    ACTIVE: 'Ativo',
    PAUSED: 'Pausado',
    ARCHIVED: 'Arquivado',
    DELETED: 'Excluído',
  };
  return map[status?.toUpperCase()] ?? status;
}
