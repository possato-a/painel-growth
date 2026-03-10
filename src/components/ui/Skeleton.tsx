import { cn } from '@/lib/cn';

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ className, style }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded bg-notion-border',
        className
      )}
      style={style}
    />
  );
}

export function SkeletonRow({ cols = 8 }: { cols?: number }) {
  return (
    <tr className="border-b border-notion-border">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-3 py-2.5">
          <Skeleton className="h-4 w-full" style={{ width: i === 0 ? '80%' : '60%' }} />
        </td>
      ))}
    </tr>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-notion-bg-primary rounded shadow-notion-md p-5 space-y-3">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-7 w-28" />
    </div>
  );
}
