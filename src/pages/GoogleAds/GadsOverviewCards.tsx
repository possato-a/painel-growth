import {
  DollarSign, Eye, MousePointer, TrendingUp,
  BarChart, MousePointerClick, Target, Percent, BadgeDollarSign,
  type LucideProps,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import { fmtCurrency, fmtNumber, fmtPct, fmtCompact } from '@/lib/formatters';
import type { GadsDailyRow } from '@/types/gads';

type LucideIcon = React.ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & React.RefAttributes<SVGSVGElement>>;

interface Props { data: GadsDailyRow[] | undefined; isLoading: boolean; }

interface KpiCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  primary?: boolean;
  isLoading?: boolean;
  highlight?: 'green';
}

function KpiCard({ label, value, icon: Icon, primary, isLoading, highlight }: KpiCardProps) {
  if (isLoading) {
    return (
      <div className="bg-notion-bg-primary rounded shadow-notion-md p-5">
        <Skeleton className="h-3 w-20 mb-3" />
        <Skeleton className="h-7 w-28" />
      </div>
    );
  }
  return (
    <div className={`bg-notion-bg-primary rounded shadow-notion-md p-5 relative transition-shadow duration-[120ms] hover:shadow-notion-lg ${primary ? 'ring-1 ring-notion-primary/20' : ''}`}>
      <div className="absolute top-4 right-4">
        <Icon size={16} className={highlight === 'green' ? 'text-[#0F7B6C]/60' : 'text-notion-text-tertiary'} />
      </div>
      <p className="text-xs font-medium text-notion-text-secondary uppercase tracking-wider mb-2 pr-6">{label}</p>
      <p className={`font-bold leading-none ${primary ? 'text-2xl text-notion-text-primary' : 'text-xl'} ${highlight === 'green' ? 'text-[#0F7B6C]' : 'text-notion-text-primary'}`}>
        {value}
      </p>
    </div>
  );
}

function sumDays(data: GadsDailyRow[]) {
  return data.reduce(
    (acc, d) => ({
      spend:       acc.spend       + Number(d.spend       || 0),
      impressions: acc.impressions + Number(d.impressions || 0),
      clicks:      acc.clicks      + Number(d.clicks      || 0),
      conversions: acc.conversions + Number(d.conversions || 0),
    }),
    { spend: 0, impressions: 0, clicks: 0, conversions: 0 }
  );
}

function derivedAvg(data: GadsDailyRow[]) {
  if (!data.length) return { ctr: 0, cpm: 0, cpc: 0, convRate: 0, costPerConv: 0 };
  const s = sumDays(data);
  const ctr      = s.impressions > 0 ? (s.clicks / s.impressions) * 100 : 0;
  const cpm      = s.impressions > 0 ? (s.spend / s.impressions) * 1000 : 0;
  const cpc      = s.clicks > 0 ? s.spend / s.clicks : 0;
  const convRate = s.clicks > 0 ? (s.conversions / s.clicks) * 100 : 0;
  const costPerConv = s.conversions > 0 ? s.spend / s.conversions : 0;
  return { ctr, cpm, cpc, convRate, costPerConv };
}

export function GadsOverviewCards({ data, isLoading }: Props) {
  const sums   = data ? sumDays(data) : null;
  const derived = data ? derivedAvg(data) : null;

  const cards: KpiCardProps[] = [
    { label: 'Investimento',  value: sums    ? fmtCurrency(sums.spend)          : '—', icon: DollarSign,      primary: true  },
    { label: 'Conversões',    value: sums    ? fmtNumber(sums.conversions)       : '—', icon: Target,          highlight: 'green' },
    { label: 'Custo / Conv.', value: derived ? fmtCurrency(derived.costPerConv) : '—', icon: BadgeDollarSign, highlight: 'green' },
    { label: 'Taxa de Conv.', value: derived ? fmtPct(derived.convRate)         : '—', icon: Percent,         highlight: 'green' },
    { label: 'Impressões',    value: sums    ? fmtCompact(sums.impressions)      : '—', icon: Eye          },
    { label: 'Cliques',       value: sums    ? fmtNumber(sums.clicks)           : '—', icon: MousePointer },
    { label: 'CTR',           value: derived ? fmtPct(derived.ctr)              : '—', icon: TrendingUp   },
    { label: 'CPM',           value: derived ? fmtCurrency(derived.cpm)         : '—', icon: BarChart     },
    { label: 'CPC',           value: derived ? fmtCurrency(derived.cpc)         : '—', icon: MousePointerClick },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9 gap-3">
      {cards.map((card) => (
        <KpiCard key={card.label} {...card} isLoading={isLoading} />
      ))}
    </div>
  );
}
