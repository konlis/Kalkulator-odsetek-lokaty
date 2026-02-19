import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { DayEvent, LoanConfig, LoanSummary } from '@/types';
import { TRANSACTION_TYPE_LABELS, CAPITALIZATION_LABELS } from '@/constants';
import { formatCurrency } from './formatters';
import { ROBOTO_REGULAR_BASE64 } from './roboto-font';

function registerFont(doc: jsPDF) {
  doc.addFileToVFS('Roboto-Regular.ttf', ROBOTO_REGULAR_BASE64);
  doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
  doc.setFont('Roboto');
}

export function downloadPDF(
  events: DayEvent[],
  summary: LoanSummary,
  config: LoanConfig
) {
  const doc = new jsPDF({ orientation: 'landscape' });
  registerFont(doc);

  const currency = config.currency ?? 'PLN';
  const fmt = (amount: number) => formatCurrency(amount, currency);

  // Title
  doc.setFontSize(16);
  doc.text('Kalkulator Pożyczki Inwestorskiej', 14, 15);

  // Config summary
  const capitalizationLabel = CAPITALIZATION_LABELS[config.capitalization ?? 'none'];
  doc.setFontSize(10);
  doc.text(
    [
      `Kapitał początkowy: ${fmt(config.initialCapital)}`,
      `Oprocentowanie: ${config.annualInterestRate}%`,
      `Kapitalizacja: ${capitalizationLabel}`,
      `Waluta: ${currency}`,
      `Data startu: ${config.startDate}`,
      `Data końca: ${config.endDate ?? 'dziś'}`,
    ].join('   |   '),
    14,
    25
  );

  // Summary table
  const summaryBody: string[][] = [
    ['Pozostały kapitał', fmt(summary.currentPrincipal)],
    ['Odsetki do spłaty', fmt(summary.totalAccruedInterest)],
    ['Łączne zobowiązanie', fmt(summary.totalOwed)],
    ['Łącznie wpłacono', fmt(summary.totalDeposited)],
    ['Łącznie wypłacono', fmt(summary.totalWithdrawn)],
    ['Dni trwania', `${summary.daysElapsed}`],
  ];
  if (summary.totalCapitalizedInterest > 0) {
    summaryBody.splice(3, 0,
      ['Odsetki skapitalizowane', fmt(summary.totalCapitalizedInterest)],
    );
  }

  // Exchange rate info
  if (config.investorCurrency === 'USD' && config.exchangeRateAtStart && config.exchangeRateCurrent) {
    const fmtUsd = (amount: number) => formatCurrency(amount, 'USD');
    const investedUsd = config.initialCapital / config.exchangeRateAtStart;
    const currentValueUsd = summary.totalOwed / config.exchangeRateCurrent;
    const exchangeGainLoss = currentValueUsd - (summary.totalOwed / config.exchangeRateAtStart);

    summaryBody.push(
      ['', ''],
      ['PRZELICZNIK USD', ''],
      ['Kurs PLN/USD w dniu pożyczki', config.exchangeRateAtStart.toFixed(4)],
      ['Bieżący kurs PLN/USD', config.exchangeRateCurrent.toFixed(4)],
      ['Zainwestowano (USD)', fmtUsd(investedUsd)],
      ['Wartość bieżąca (USD)', fmtUsd(currentValueUsd)],
      ['Zysk/strata na kursie', fmtUsd(exchangeGainLoss)],
    );
  }

  const fontStyles = { font: 'Roboto' as const };

  autoTable(doc, {
    startY: 32,
    head: [['Wskaźnik', 'Wartość']],
    body: summaryBody,
    theme: 'grid',
    styles: { fontSize: 9, ...fontStyles },
    headStyles: { fillColor: [41, 128, 185], ...fontStyles },
  });

  // Events with transactions only
  const txEvents = events.filter((e) => e.transactionType);

  if (txEvents.length > 0) {
    autoTable(doc, {
      startY: (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10,
      head: [['Data', 'Typ', 'Kwota', 'Odsetki dnia', 'Kapitał po', 'Odsetki po', 'Łącznie']],
      body: txEvents.map((e) => [
        e.date,
        e.transactionType ? TRANSACTION_TYPE_LABELS[e.transactionType] : '',
        e.transactionAmount != null ? fmt(e.transactionAmount) : '',
        fmt(e.dailyInterest),
        fmt(e.principalAfter),
        fmt(e.accruedInterestAfter),
        fmt(e.totalOwed),
      ]),
      theme: 'striped',
      styles: { fontSize: 8, ...fontStyles },
      headStyles: { fillColor: [41, 128, 185], ...fontStyles },
    });
  }

  doc.save(`pozyczka-${new Date().toISOString().slice(0, 10)}.pdf`);
}
