/**
 * components/analytics/PerformanceCharts.tsx
 * ----------------------------------------------------------------------------
 * Three small recharts wrappers for the dashboard. Grouped in one file
 * since they're small, closely related, and always used together.
 *
 * Recharts renders colors as literal SVG attributes, which can't resolve
 * CSS custom properties — so `chartPalette()` below hand-picks concrete hex
 * values for the current theme instead of reading them from CSS.
 * ----------------------------------------------------------------------------
 */

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useTheme } from '../../hooks/useTheme';
import { formatCurrency } from '../../utils/format';
import { Card } from '../common/Card';
import { EmptyState } from '../common/EmptyState';
import { TrendingUpIcon } from '../common/icons';

function chartPalette(theme: 'light' | 'dark') {
  return theme === 'dark'
    ? { grid: '#262e40', axis: '#8b93a8', profit: '#22c55e', loss: '#f87171', accent: '#2dd4c0', tooltipBg: '#171d2b' }
    : { grid: '#e6e9ef', axis: '#6b7280', profit: '#16a34a', loss: '#dc2626', accent: '#0f9488', tooltipBg: '#ffffff' };
}

interface EquityCurveChartProps {
  data: { date: string; cumulativePnl: number }[];
}

export function EquityCurveChart({ data }: EquityCurveChartProps) {
  const { theme } = useTheme();
  const palette = chartPalette(theme);

  if (data.length === 0) {
    return (
      <Card title="Equity curve">
        <EmptyState
          icon={<TrendingUpIcon size={22} />}
          title="No closed trades yet"
          description="Your cumulative PnL will chart here once you close your first trade."
        />
      </Card>
    );
  }

  return (
    <Card title="Equity curve" className="chart-card">
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={palette.grid} strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="date" stroke={palette.axis} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
          <YAxis
            stroke={palette.axis}
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value: number) => formatCurrency(value)}
            width={80}
          />
          <Tooltip
            formatter={(value) => formatCurrency(Number(value))}
            contentStyle={{ background: palette.tooltipBg, border: `1px solid ${palette.grid}`, borderRadius: 8 }}
          />
          <Line
            type="monotone"
            dataKey="cumulativePnl"
            stroke={palette.accent}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}

interface SymbolPerformanceChartProps {
  data: { symbol: string; pnl: number }[];
}

export function SymbolPerformanceChart({ data }: SymbolPerformanceChartProps) {
  const { theme } = useTheme();
  const palette = chartPalette(theme);

  if (data.length === 0) {
    return (
      <Card title="PnL by symbol">
        <EmptyState title="Nothing to show yet" description="Close a few trades to see this break down by symbol." />
      </Card>
    );
  }

  return (
    <Card title="PnL by symbol" className="chart-card">
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={palette.grid} strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="symbol" stroke={palette.axis} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
          <YAxis
            stroke={palette.axis}
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value: number) => formatCurrency(value)}
            width={80}
          />
          <Tooltip
            formatter={(value) => formatCurrency(Number(value))}
            contentStyle={{ background: palette.tooltipBg, border: `1px solid ${palette.grid}`, borderRadius: 8 }}
          />
          <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
            {data.map((entry) => (
              <Cell key={entry.symbol} fill={entry.pnl >= 0 ? palette.profit : palette.loss} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

interface WinLossChartProps {
  wins: number;
  losses: number;
  breakeven: number;
}

export function WinLossChart({ wins, losses, breakeven }: WinLossChartProps) {
  const { theme } = useTheme();
  const palette = chartPalette(theme);

  const slices = [
    { name: 'Wins', value: wins, color: palette.profit },
    { name: 'Losses', value: losses, color: palette.loss },
    ...(breakeven > 0 ? [{ name: 'Breakeven', value: breakeven, color: palette.axis }] : []),
  ];
  const total = wins + losses + breakeven;

  if (total === 0) {
    return (
      <Card title="Win / loss">
        <EmptyState title="No closed trades yet" description="Your win rate breakdown will appear here." />
      </Card>
    );
  }

  return (
    <Card title="Win / loss" className="chart-card">
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie data={slices} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
            {slices.map((slice) => (
              <Cell key={slice.name} fill={slice.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => [`${value} trades`, name]}
            contentStyle={{ background: palette.tooltipBg, border: `1px solid ${palette.grid}`, borderRadius: 8 }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="chart-legend">
        {slices.map((slice) => (
          <span key={slice.name} className="chart-legend-item">
            <span className="chart-legend-swatch" style={{ background: slice.color }} />
            {slice.name} ({slice.value})
          </span>
        ))}
      </div>
    </Card>
  );
}