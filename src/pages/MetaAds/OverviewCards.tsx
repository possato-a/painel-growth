import {
  DollarSign,
  Eye,
  Users,
  MousePointer,
  TrendingUp,
  BarChart,
  MousePointerClick,
  type LucideProps,
} from 'lucide-react';

type LucideIcon = React.ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & React.RefAttributes<SVGSVGElement>>;
import { Skeleton } from '@/components/ui/Skeleton';
import { fmtCurrency, fmtNumber, fmtPct, fmtCompact } from '@/lib/formatters';
import type { MetaDailyInsight } from '@/types/meta';

interface OverviewCardsProps {
  data: MetaDailyInsight[] | undefined;
  isLoading: boolean;
}

interface KpiCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  primary?: boolean;
  isLoading?: boolean;
}

function KpiCard({ label, value, icon: Icon, primary, isLoading }: KpiCardProps) {
  if (isLoading) {
    return (
      <div className="bg-notion-bg-primary rounded shadow-notion-md p-5">
        <Skeleton className="h-3 w-20 mb-3" />
        <Skeleton className="h-7 w-28" />
      </div>
    );
  }

  return (
    <div
      className={`bg-notion-bg-primary rounded shadow-notion-md p-5 relative transition-shadow duration-[120ms] hover:shadow-notion-lg ${
        primary ? 'ring-1 ring-notion-primary/20' : ''
      }`}
    >
      {/* Icon top-right */}
      <div className="absolute top-4 right-4">
        <Icon size={16} className="text-notion-text-tertiary" />
      </div>

      {/* Label */}
      <p className="text-xs font-medium text-notion-text-secondary uppercase tracking-wider mb-2 pr-6">
        {label}
      </p>

      {/* Value */}
      <p
        className={`font-bold text-notion-text-primary leading-none ${
          primary ? 'text-2xl' : 'text-xl'
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function sumInsights(data: MetaDailyInsight[]) {
  return data.reduce(
    (acc, d) => ({
      spend: acc.spend + Number(d.spend || 0),
      impressions: acc.impressions + Number(d.impressions || 0),
      reach: acc.reach + Number(d.reach || 0),
      clicks: acc.clicks + Number(d.clicks || 0),
    }),
    { spend: 0, impressions: 0, reach: 0, clicks: 0 }
  );
}

function avgInsights(data: MetaDailyInsight[]) {
  if (data.length === 0) return { cpm: 0, cpc: 0, ctr: 0 };
  const totals = data.reduce(
    (acc, d) => ({
      cpm: acc.cpm + Number(d.cpm || 0),
      cpc: acc.cpc + Number(d.cpc || 0),
      ctr: acc.ctr + Number(d.ctr || 0),
    }),
    { cpm: 0, cpc: 0, ctr: 0 }
  );
  return {
    cpm: totals.cpm / data.length,
    cpc: totals.cpc / data.length,
    ctr: totals.ctr / data.length,
  };
}

export function OverviewCards({ data, isLoading }: OverviewCardsProps) {
  const sums = data ? sumInsights(data) : null;
  const avgs = data ? avgInsights(data) : null;

  const cards: KpiCardProps[] = [
    {
      label: 'Investimento',
      value: sums ? fmtCurrency(sums.spend) : '—',
      icon: DollarSign,
      primary: true,
    },
    {
      label: 'Impressões',
      value: sums ? fmtCompact(sums.impressions) : '—',
      icon: Eye,
    },
    {
      label: 'Alcance',
      value: sums ? fmtCompact(sums.reach) : '—',
      icon: Users,
    },
    {
      label: 'Cliques',
      value: sums ? fmtNumber(sums.clicks) : '—',
      icon: MousePointer,
    },
    {
      label: 'CTR',
      value: avgs ? fmtPct(avgs.ctr) : '—',
      icon: TrendingUp,
    },
    {
      label: 'CPM',
      value: avgs ? fmtCurrency(avgs.cpm) : '—',
      icon: BarChart,
    },
    {
      label: 'CPC',
      value: avgs ? fmtCurrency(avgs.cpc) : '—',
      icon: MousePointerClick,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
      {cards.map((card) => (
        <KpiCard
          key={card.label}
          {...card}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
}
