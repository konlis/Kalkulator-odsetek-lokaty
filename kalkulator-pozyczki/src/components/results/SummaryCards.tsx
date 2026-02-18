import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCalculation } from '@/hooks/use-calculation';
import { formatPLN } from '@/lib/formatters';
import { Wallet, TrendingUp, ArrowDownCircle, Calendar } from 'lucide-react';

export function SummaryCards() {
  const { summary } = useCalculation();

  const cards = [
    {
      title: 'Pozostały kapitał',
      value: formatPLN(summary.currentPrincipal),
      icon: Wallet,
      description: `Wpłacono: ${formatPLN(summary.totalCapitalDeposited)}`,
    },
    {
      title: 'Odsetki do zapłaty',
      value: formatPLN(summary.totalAccruedInterest),
      icon: TrendingUp,
      description: `Zapłacono: ${formatPLN(summary.totalInterestPaid)}`,
    },
    {
      title: 'Łączne zobowiązanie',
      value: formatPLN(summary.totalOwed),
      icon: ArrowDownCircle,
      description: `Spłacono kapitału: ${formatPLN(summary.totalCapitalRepaid)}`,
    },
    {
      title: 'Czas trwania',
      value: `${summary.daysElapsed} dni`,
      icon: Calendar,
      description: summary.totalCapitalizedInterest > 0
        ? `Skapitalizowano: ${formatPLN(summary.totalCapitalizedInterest)}`
        : `Dziennie: ${formatPLN(summary.currentPrincipal * summary.dailyInterestRate)}`,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
