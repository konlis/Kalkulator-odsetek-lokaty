import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCalculation } from '@/hooks/use-calculation';
import { useLoanStore } from '@/hooks/use-loan-store';
import { formatCurrency } from '@/lib/formatters';
import { Wallet, TrendingUp, ArrowDownCircle, Calendar, DollarSign } from 'lucide-react';

export function SummaryCards() {
  const { summary } = useCalculation();
  const { activeLoan } = useLoanStore();
  const { config } = activeLoan;
  const fmt = (amount: number) => formatCurrency(amount, config.currency);
  const fmtUsd = (amount: number) => formatCurrency(amount, 'USD');

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

  const hasExchangeRate =
    config.investorCurrency === 'USD' &&
    config.exchangeRateAtStart &&
    config.exchangeRateCurrent;

  const usdCards = hasExchangeRate
    ? (() => {
        const rateStart = config.exchangeRateAtStart!;
        const rateCurrent = config.exchangeRateCurrent!;
        const investedUsd = config.initialCapital / rateStart;
        const currentValueUsd = summary.totalOwed / rateCurrent;
        const exchangeGainLoss = currentValueUsd - (summary.totalOwed / rateStart);

        return [
          {
            title: 'Zainwestowano (USD)',
            value: fmtUsd(investedUsd),
            icon: DollarSign,
            description: `Kurs w dniu pożyczki: ${rateStart.toFixed(4)}`,
          },
          {
            title: 'Wartość bieżąca (USD)',
            value: fmtUsd(currentValueUsd),
            icon: DollarSign,
            description: `Bieżący kurs: ${rateCurrent.toFixed(4)}`,
          },
          {
            title: 'Zysk/strata na kursie',
            value: fmtUsd(exchangeGainLoss),
            icon: DollarSign,
            description: exchangeGainLoss >= 0
              ? 'Kurs korzystny dla inwestora'
              : 'Kurs niekorzystny dla inwestora',
            colorClass: exchangeGainLoss >= 0
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400',
          },
        ];
      })()
    : [];

  return (
    <div className="space-y-4">
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

      {usdCards.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-3">
          {usdCards.map((card) => (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                <card.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${'colorClass' in card ? card.colorClass : ''}`}>
                  {card.value}
                </div>
                <p className="text-xs text-muted-foreground">{card.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
