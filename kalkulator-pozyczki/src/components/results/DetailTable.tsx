import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useCalculation } from '@/hooks/use-calculation';
import { useLoanStore } from '@/hooks/use-loan-store';
import { TransactionTypeBadge } from '@/components/loan/TransactionTypeBadge';
import { formatCurrency, formatDatePL } from '@/lib/formatters';
import { TableIcon, Eye, EyeOff } from 'lucide-react';

export function DetailTable() {
  const { events } = useCalculation();
  const { activeLoan } = useLoanStore();
  const fmt = (amount: number) => formatCurrency(amount, activeLoan.config.currency);
  const [showAll, setShowAll] = useState(false);

  // Filter: only events with transactions, unless showAll
  const displayEvents = showAll
    ? events
    : events.filter((e) => e.transactionType);

  if (events.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TableIcon className="h-5 w-5" />
            Szczegółowe zdarzenia
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? (
              <>
                <EyeOff className="mr-1 h-4 w-4" />
                Tylko zdarzenia
              </>
            ) : (
              <>
                <Eye className="mr-1 h-4 w-4" />
                Wszystkie dni
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Typ</TableHead>
                <TableHead className="text-right">Kwota</TableHead>
                <TableHead className="text-right">Odsetki dnia</TableHead>
                <TableHead className="text-right">Kapitał</TableHead>
                <TableHead className="text-right">Naliczone odsetki</TableHead>
                <TableHead className="text-right">Łącznie</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayEvents.map((event, i) => (
                <TableRow key={`${event.date}-${i}`}>
                  <TableCell className="whitespace-nowrap">
                    {formatDatePL(event.date)}
                  </TableCell>
                  <TableCell>
                    {event.transactionType ? (
                      <TransactionTypeBadge type={event.transactionType} />
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    {event.transactionAmount ? fmt(event.transactionAmount) : '—'}
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    {fmt(event.dailyInterest)}
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    {fmt(event.principalAfter)}
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    {fmt(event.accruedInterestAfter)}
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap font-medium">
                    {fmt(event.totalOwed)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
