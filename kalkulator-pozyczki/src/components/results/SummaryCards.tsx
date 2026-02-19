import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCalculation } from '@/hooks/use-calculation';
import { useLoanStore } from '@/hooks/use-loan-store';
import { formatCurrency } from '@/lib/formatters';
import { Wallet, TrendingUp, ArrowDownCircle, Calendar } from 'lucide-react';

export function SummaryCards() {
  const { summary } = useCalculation();
  const { activeLoan } = useLoanStore();
  const fmt = (amount: number) => formatCurrency(amount, activeLoan.config.currency);

  const cards = [
    {
      title: 'Kapitał',
      value: fmt(summary.currentPrincipal),
      icon: Wallet,
      description: `Wpłacono: ${fmt(summary.totalDeposited)}`,
    },
    {
      title: 'Odsetki do spłaty',
      value: fmt(summary.totalAccruedInterest),
      icon: TrendingUp,
      description: `Wypłacono: ${fmt(summary.totalWithdrawn)}`,
    },
    {
      title: 'Łączne zobowiązanie',
      value: fmt(summary.totalOwed),
      icon: ArrowDownCircle,
      description: summary.totalCapitalizedInterest > 0
        ? `Skapitalizowano: ${fmt(summary.totalCapitalizedInterest)}`
        : 'Kapitał + odsetki',
    },
    {
      title: 'Czas trwania',
      value: `${summary.daysElapsed} dni`,
      icon: Calendar,
      description: `Dziennie: ${fmt(summary.currentPrincipal * summary.dailyInterestRate)}`,
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
