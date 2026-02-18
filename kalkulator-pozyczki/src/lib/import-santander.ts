import type { TransactionType } from '@/types';

export interface ParsedTransaction {
  date: string;       // YYYY-MM-DD
  amount: number;     // Always positive
  type: TransactionType;
  title: string;      // e.g. "UMOWA NR 01/04/2024 Odsetki"
  note: string;       // Transfer type e.g. "PRZELEW ELIXIR - ONLINE"
}

/**
 * Extract all text from a PDF file using pdf.js.
 */
export async function extractTextFromPdf(file: File): Promise<string> {
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.mjs',
    import.meta.url,
  ).toString();

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const pages: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items
      .map((item) => ('str' in item ? item.str : ''))
      .join('\n');
    pages.push(text);
  }

  return pages.join('\n');
}

/**
 * Parse Santander bank statement text into transactions.
 */
export function parseSantanderText(text: string): ParsedTransaction[] {
  const transactions: ParsedTransaction[] = [];

  // Split into blocks starting with "Data operacji"
  // Each transaction block starts with "Data operacji\nYYYY-MM-DD"
  const blockRegex = /Data operacji\n(\d{4}-\d{2}-\d{2})/g;
  const blockStarts: { index: number; date: string }[] = [];

  let match;
  while ((match = blockRegex.exec(text)) !== null) {
    blockStarts.push({ index: match.index, date: match[1] });
  }

  for (let i = 0; i < blockStarts.length; i++) {
    const start = blockStarts[i].index;
    const end = i + 1 < blockStarts.length ? blockStarts[i + 1].index : text.length;
    const block = text.slice(start, end);
    const date = blockStarts[i].date;

    // Extract amount: look for pattern like "-5 000,00 PLN" or "50 000,00 PLN" or "100 000,00 PLN"
    // The amount appears before "PLN" followed by saldo
    // Pattern: optional minus, digits with optional space separators, comma, two digits, then PLN
    const amountRegex = /(-?[\d ]+,\d{2})\s*PLN/g;
    const amounts: { value: number; sign: number }[] = [];
    let amountMatch;
    while ((amountMatch = amountRegex.exec(block)) !== null) {
      const raw = amountMatch[1].replace(/\s/g, '').replace(',', '.');
      const value = parseFloat(raw);
      if (!isNaN(value)) {
        amounts.push({ value: Math.abs(value), sign: value >= 0 ? 1 : -1 });
      }
    }

    // First amount is the transaction amount, second is saldo (ignore)
    if (amounts.length === 0) continue;
    const txAmount = amounts[0];

    // Extract title: "Tytuł: ..."
    const titleMatch = block.match(/Tytuł:\s*(.+?)(?:\n|$)/);
    const title = titleMatch ? titleMatch[1].trim() : '';

    // Extract transfer type (first line after date block header)
    // After "Data księgowania\nYYYY-MM-DD\n" comes the transfer type
    const typeMatch = block.match(/Data księgowania\n\d{4}-\d{2}-\d{2}\n(.+?)(?:\n|$)/);
    const transferType = typeMatch ? typeMatch[1].trim() : '';

    // Determine transaction type based on rules
    const type = classifyTransaction(txAmount.sign, title, transferType);

    transactions.push({
      date,
      amount: txAmount.value,
      type,
      title,
      note: transferType,
    });
  }

  return transactions;
}

function classifyTransaction(
  sign: number,
  title: string,
  transferType: string,
): TransactionType {
  // Positive amount (UZNANIE / UZNANIE SORBNET) → capital_deposit
  if (sign > 0 || /^UZNANIE/i.test(transferType)) {
    return 'capital_deposit';
  }

  const titleLower = title.toLowerCase();

  // Negative + "odsetki" in title → interest_payment
  if (titleLower.includes('odsetki')) {
    return 'interest_payment';
  }

  // Negative + "spłata" in title → capital_repayment
  if (titleLower.includes('spłata') || titleLower.includes('splata')) {
    return 'capital_repayment';
  }

  // Negative + no keyword → default to interest_payment
  return 'interest_payment';
}
