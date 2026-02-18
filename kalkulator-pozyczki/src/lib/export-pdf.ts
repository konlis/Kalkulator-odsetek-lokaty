import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { DayEvent, LoanConfig, LoanSummary } from '@/types';
import { TRANSACTION_TYPE_LABELS } from '@/constants';

export function downloadPDF(
  events: DayEvent[],
  summary: LoanSummary,
  config: LoanConfig
) {
  const doc = new jsPDF({ orientation: 'landscape' });

  // Title
  doc.setFontSize(16);
  doc.text('Kalkulator Pozyczki Inwestorskiej', 14, 15);

  // Config summary
  doc.setFontSize(10);
  doc.text(
    [
      `Kapital poczatkowy: ${config.initialCapital.toFixed(2)} PLN`,
      `Oprocentowanie: ${config.annualInterestRate}%`,
      `Data startu: ${config.startDate}`,
      `Data konca: ${config.endDate ?? 'dzis'}`,
    ].join('   |   '),
    14,
    25
  );

  // Summary table
  autoTable(doc, {
    startY: 32,
    head: [['Wskaznik', 'Wartosc']],
    body: [
      ['Pozostaly kapital', `${summary.currentPrincipal.toFixed(2)} PLN`],
      ['Naliczone odsetki', `${summary.totalAccruedInterest.toFixed(2)} PLN`],
      ['Laczne zobowiazanie', `${summary.totalOwed.toFixed(2)} PLN`],
      ['Odsetki zaplacone', `${summary.totalInterestPaid.toFixed(2)} PLN`],
      ['Kapital splacony', `${summary.totalCapitalRepaid.toFixed(2)} PLN`],
      ['Dni trwania', `${summary.daysElapsed}`],
    ],
    theme: 'grid',
    styles: { fontSize: 9 },
    headStyles: { fillColor: [41, 128, 185] },
  });

  // Events with transactions only
  const txEvents = events.filter((e) => e.transactionType);

  if (txEvents.length > 0) {
    autoTable(doc, {
      startY: (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10,
      head: [['Data', 'Typ', 'Kwota', 'Odsetki dnia', 'Kapital po', 'Odsetki po', 'Lacznie']],
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
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] },
    });
  }

  doc.save(`pozyczka-${new Date().toISOString().slice(0, 10)}.pdf`);
}
