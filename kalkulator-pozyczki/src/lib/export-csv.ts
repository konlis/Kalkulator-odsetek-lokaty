import type { DayEvent, LoanSummary } from '@/types';
import { TRANSACTION_TYPE_LABELS } from '@/constants';

export function generateCSV(events: DayEvent[], summary: LoanSummary): string {
  const BOM = '\uFEFF'; // UTF-8 BOM for Excel compatibility
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
      e.transactionAmount?.toFixed(2) ?? '',
      e.dailyInterest.toFixed(2),
      e.principalAfter.toFixed(2),
      e.accruedInterestAfter.toFixed(2),
      e.totalOwed.toFixed(2),
      e.transactionNote ?? '',
    ].join(';')
  );

  const summaryRows = [
    '',
    'PODSUMOWANIE',
    `Pozostały kapitał;${summary.currentPrincipal.toFixed(2)}`,
    `Odsetki do spłaty;${summary.totalAccruedInterest.toFixed(2)}`,
    `Łączne zobowiązanie;${summary.totalOwed.toFixed(2)}`,
    `Łącznie wpłacono;${summary.totalDeposited.toFixed(2)}`,
    `Łącznie wypłacono;${summary.totalWithdrawn.toFixed(2)}`,
    `Odsetki skapitalizowane;${summary.totalCapitalizedInterest.toFixed(2)}`,
    `Dni trwania;${summary.daysElapsed}`,
  ];

  return BOM + [header, ...rows, ...summaryRows].join('\n');
}

export function downloadCSV(events: DayEvent[], summary: LoanSummary) {
  const csv = generateCSV(events, summary);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `pozyczka-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
