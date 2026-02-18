import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { DayEvent, LoanConfig, LoanSummary } from '@/types';
import { TRANSACTION_TYPE_LABELS, CAPITALIZATION_LABELS } from '@/constants';
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

  // Title
  doc.setFontSize(16);
  doc.text('Kalkulator Pożyczki Inwestorskiej', 14, 15);

  // Config summary
  const capitalizationLabel = CAPITALIZATION_LABELS[config.capitalization ?? 'none'];
  doc.setFontSize(10);
  doc.text(
    [
      `Kapitał początkowy: ${config.initialCapital.toFixed(2)} PLN`,
      `Oprocentowanie: ${config.annualInterestRate}%`,
      `Kapitalizacja: ${capitalizationLabel}`,
      `Data startu: ${config.startDate}`,
      `Data końca: ${config.endDate ?? 'dziś'}`,
    ].join('   |   '),
    14,
    25
  );

  // Summary table
  const summaryBody: string[][] = [
    ['Pozostały kapitał', `${summary.currentPrincipal.toFixed(2)} PLN`],
    ['Odsetki pozostałe do zapłaty', `${summary.totalAccruedInterest.toFixed(2)} PLN`],
    ['Łączne zobowiązanie', `${summary.totalOwed.toFixed(2)} PLN`],
    ['Łącznie wpłacono', `${summary.totalDeposited.toFixed(2)} PLN`],
    ['Odsetki wypłacone', `${summary.totalInterestPaid.toFixed(2)} PLN`],
    ['Kapitał wypłacony', `${summary.totalCapitalRepaid.toFixed(2)} PLN`],
    ['Dni trwania', `${summary.daysElapsed}`],
  ];
  if (summary.totalCapitalizedInterest > 0) {
    summaryBody.splice(3, 0,
      ['Odsetki skapitalizowane', `${summary.totalCapitalizedInterest.toFixed(2)} PLN`],
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
        e.transactionAmount?.toFixed(2) ?? '',
        e.dailyInterest.toFixed(2),
        e.principalAfter.toFixed(2),
        e.accruedInterestAfter.toFixed(2),
        e.totalOwed.toFixed(2),
      ]),
      theme: 'striped',
      styles: { fontSize: 8, ...fontStyles },
      headStyles: { fillColor: [41, 128, 185], ...fontStyles },
    });
  }

  doc.save(`pozyczka-${new Date().toISOString().slice(0, 10)}.pdf`);
}
