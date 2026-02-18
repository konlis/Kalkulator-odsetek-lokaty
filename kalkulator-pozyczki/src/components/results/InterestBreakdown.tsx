import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCalculation } from '@/hooks/use-calculation';
import { useLoanStore } from '@/hooks/use-loan-store';
import { formatPLN, formatPercent } from '@/lib/formatters';
import { Calculator } from 'lucide-react';

export function InterestBreakdown() {
  const { summary } = useCalculation();
  const { state } = useLoanStore();

  const dailyRate = state.config.annualInterestRate / 365;
  const dailyInterestOnCurrent = summary.currentPrincipal * (state.config.annualInterestRate / 100 / 365);
  const totalInterestGenerated = summary.totalAccruedInterest + summary.totalWithdrawn + summary.totalCapitalizedInterest;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Szczegóły odsetek
        </CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="space-y-3">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Oprocentowanie roczne</dt>
            <dd className="font-medium">{formatPercent(state.config.annualInterestRate)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Oprocentowanie dzienne</dt>
            <dd className="font-medium">{formatPercent(dailyRate)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Odsetki dzienne (aktualne)</dt>
            <dd className="font-medium">{formatPLN(dailyInterestOnCurrent)}</dd>
          </div>
          <hr className="border-border" />
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Łączne naliczone odsetki</dt>
            <dd className="font-medium">{formatPLN(totalInterestGenerated)}</dd>
          </div>
          {summary.totalCapitalizedInterest > 0 && (
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Skapitalizowane (dodane do kapitału)</dt>
              <dd className="font-medium text-blue-600 dark:text-blue-400">
                {formatPLN(summary.totalCapitalizedInterest)}
              </dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Wypłacono</dt>
            <dd className="font-medium text-green-600 dark:text-green-400">
              {formatPLN(summary.totalWithdrawn)}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Odsetki do spłaty</dt>
            <dd className="font-medium text-amber-600 dark:text-amber-400">
              {formatPLN(summary.totalAccruedInterest)}
            </dd>
          </div>
          <hr className="border-border" />
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Łącznie wpłacono</dt>
            <dd className="font-medium">{formatPLN(summary.totalDeposited)}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
