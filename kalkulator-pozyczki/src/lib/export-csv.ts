import type { DayEvent, LoanSummary, Currency } from '@/types';
import { TRANSACTION_TYPE_LABELS } from '@/constants';
import { formatCurrency } from './formatters';

export function generateCSV(events: DayEvent[], summary: LoanSummary, currency: Currency): string {
  const BOM = '\uFEFF'; // UTF-8 BOM for Excel compatibility
  const fmt = (amount: number) => formatCurrency(amount, currency);

  const header = [
    'Data',
    'Typ',
    'Kwota transakcji',
    'Odsetki dnia',
    'Kapitał po',
    'Naliczone odsetki po',
    'Łącznie do spłaty',
    'Notatka',
  ].join(';');

  const rows = events.map((e) =>
    [
      e.date,
      e.transactionType ? TRANSACTION_TYPE_LABELS[e.transactionType] : '',
      e.transactionAmount != null ? fmt(e.transactionAmount) : '',
      fmt(e.dailyInterest),
      fmt(e.principalAfter),
      fmt(e.accruedInterestAfter),
      fmt(e.totalOwed),
      e.transactionNote ?? '',
    ].join(';')
  );

  const summaryRows = [
    '',
    'PODSUMOWANIE',
    `Pozostały kapitał;${fmt(summary.currentPrincipal)}`,
    `Odsetki do spłaty;${fmt(summary.totalAccruedInterest)}`,
    `Łączne zobowiązanie;${fmt(summary.totalOwed)}`,
    `Łącznie wpłacono;${fmt(summary.totalDeposited)}`,
    `Łącznie wypłacono;${fmt(summary.totalWithdrawn)}`,
    `Odsetki skapitalizowane;${fmt(summary.totalCapitalizedInterest)}`,
    `Dni trwania;${summary.daysElapsed}`,
  ];

  return BOM + [header, ...rows, ...summaryRows].join('\n');
}

export function downloadCSV(events: DayEvent[], summary: LoanSummary, currency: Currency) {
  const csv = generateCSV(events, summary, currency);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `pozyczka-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
