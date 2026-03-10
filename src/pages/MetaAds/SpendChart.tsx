import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Skeleton } from '@/components/ui/Skeleton';
import { fmtCurrency, fmtCompact, fmtDate } from '@/lib/formatters';
import type { MetaDailyInsight } from '@/types/meta';

interface SpendChartProps {
  data: MetaDailyInsight[] | undefined;
  isLoading: boolean;
}

interface ChartDataPoint {
  date: string;
  rawDate: string;
  spend: number;
  impressions: number;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-notion-bg-primary border border-notion-border rounded shadow-notion-lg px-3 py-2.5 text-sm">
      <p className="text-notion-text-secondary text-xs mb-2 font-medium">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 mb-1">
          <div
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-notion-text-secondary text-xs">{entry.name}:</span>
          <span className="text-notion-text-primary text-xs font-medium">
            {entry.name === 'Investimento'
              ? fmtCurrency(entry.value)
              : fmtCompact(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

function CustomLegend({ payload }: { payload?: Array<{ value: string; color: string }> }) {
  if (!payload) return null;
  return (
    <div className="flex items-center gap-4 justify-end pr-2">
      {payload.map((entry) => (
        <div key={entry.value} className="flex items-center gap-1.5">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs text-notion-text-secondary">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export function SpendChart({ data, isLoading }: SpendChartProps) {
  const chartData: ChartDataPoint[] = (data ?? []).map((d) => ({
    date: fmtDate(d.date_start),
    rawDate: d.date_start,
    spend: Number(d.spend || 0),
    impressions: Number(d.impressions || 0),
  }));

  return (
    <div className="bg-notion-bg-primary rounded shadow-notion-md p-5">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-semibold text-notion-text-primary">
          Desempenho Diário
        </h2>
        {data && data.length > 0 && (
          <span className="text-xs text-notion-text-tertiary">
            {data.length} dias
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : chartData.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-notion-text-tertiary text-sm">
          Nenhum dado disponível para o período selecionado.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2383E2" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#2383E2" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorImpressions" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#9B9A97" stopOpacity={0.12} />
                <stop offset="95%" stopColor="#9B9A97" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#E3E2E0"
              vertical={false}
            />

            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: '#9B9A97', fontFamily: 'Inter' }}
              tickLine={false}
              axisLine={{ stroke: '#E3E2E0' }}
              interval="preserveStartEnd"
            />

            <YAxis
              yAxisId="spend"
              orientation="left"
              tick={{ fontSize: 11, fill: '#9B9A97', fontFamily: 'Inter' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) =>
                `R$${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v.toFixed(0)}`
              }
              width={56}
            />

            <YAxis
              yAxisId="impressions"
              orientation="right"
              tick={{ fontSize: 11, fill: '#9B9A97', fontFamily: 'Inter' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => fmtCompact(v)}
              width={48}
            />

            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} verticalAlign="top" />

            <Area
              yAxisId="spend"
              type="monotone"
              dataKey="spend"
              name="Investimento"
              stroke="#2383E2"
              strokeWidth={2}
              fill="url(#colorSpend)"
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0, fill: '#2383E2' }}
            />

            <Area
              yAxisId="impressions"
              type="monotone"
              dataKey="impressions"
              name="Impressões"
              stroke="#9B9A97"
              strokeWidth={1.5}
              fill="url(#colorImpressions)"
              dot={false}
              activeDot={{ r: 3, strokeWidth: 0, fill: '#9B9A97' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
