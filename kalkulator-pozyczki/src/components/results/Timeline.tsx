import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCalculation } from '@/hooks/use-calculation';
import { useLoanStore } from '@/hooks/use-loan-store';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { formatCurrency } from '@/lib/formatters';
import { TrendingUp } from 'lucide-react';

export function Timeline() {
  const { timeline } = useCalculation();
  const { activeLoan } = useLoanStore();
  const currency = activeLoan.config.currency;

  if (timeline.length < 2) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Wykres salda w czasie
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] sm:h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeline} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickFormatter={(val: string) => val.slice(5)} // MM-DD
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(val: number) => `${(val / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(value, name) => [
                  formatCurrency(Number(value), currency),
                  name === 'principal'
                    ? 'Kapitał'
                    : name === 'accruedInterest'
                      ? 'Naliczone odsetki'
                      : 'Łącznie',
                ]}
                labelFormatter={(label) => `Data: ${String(label)}`}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Legend
                formatter={(value: string) =>
                  value === 'principal'
                    ? 'Kapitał'
                    : value === 'accruedInterest'
                      ? 'Naliczone odsetki'
                      : 'Łącznie'
                }
              />
              <Area
                type="monotone"
                dataKey="principal"
                stackId="1"
                stroke="hsl(var(--chart-1))"
                fill="hsl(var(--chart-1))"
                fillOpacity={0.4}
              />
              <Area
                type="monotone"
                dataKey="accruedInterest"
                stackId="1"
                stroke="hsl(var(--chart-2))"
                fill="hsl(var(--chart-2))"
                fillOpacity={0.4}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
