import type { DayEvent, LoanSummary, LoanConfig } from '@/types';
import { TRANSACTION_TYPE_LABELS } from '@/constants';
import { formatCurrency } from './formatters';

export function generateCSV(events: DayEvent[], summary: LoanSummary, config: LoanConfig): string {
  const BOM = '\uFEFF'; // UTF-8 BOM for Excel compatibility
  const currency = config.currency ?? 'PLN';
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

  // Exchange rate info
  if (config.investorCurrency === 'USD' && config.exchangeRateAtStart && config.exchangeRateCurrent) {
    const fmtUsd = (amount: number) => formatCurrency(amount, 'USD');
    const investedUsd = config.initialCapital / config.exchangeRateAtStart;
    const currentValueUsd = summary.totalOwed / config.exchangeRateCurrent;
    const exchangeGainLoss = currentValueUsd - (summary.totalOwed / config.exchangeRateAtStart);

    summaryRows.push(
      '',
      'PRZELICZNIK USD',
      `Kurs PLN/USD w dniu pożyczki;${config.exchangeRateAtStart.toFixed(4)}`,
      `Bieżący kurs PLN/USD;${config.exchangeRateCurrent.toFixed(4)}`,
      `Zainwestowano (USD);${fmtUsd(investedUsd)}`,
      `Wartość bieżąca (USD);${fmtUsd(currentValueUsd)}`,
      `Zysk/strata na kursie;${fmtUsd(exchangeGainLoss)}`,
    );
  }

  return BOM + [header, ...rows, ...summaryRows].join('\n');
}

export function downloadCSV(events: DayEvent[], summary: LoanSummary, config: LoanConfig) {
  const csv = generateCSV(events, summary, config);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `pozyczka-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
