import type { TransactionType } from '@/types';

export interface ParsedTransaction {
  date: string;       // YYYY-MM-DD
  amount: number;     // Always positive
  type: TransactionType;
  title: string;      // e.g. "UMOWA NR 01/04/2024"
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

    // Extract amounts from block
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

    if (amounts.length === 0) continue;
    const txAmount = amounts[0];

    // Extract title
    const titleMatch = block.match(/Tytuł:\s*(.+?)(?:\n|$)/);
    const title = titleMatch ? titleMatch[1].trim() : '';

    // Extract transfer type
    const typeMatch = block.match(/Data księgowania\n\d{4}-\d{2}-\d{2}\n(.+?)(?:\n|$)/);
    const transferType = typeMatch ? typeMatch[1].trim() : '';

    // Simple classification: positive = deposit, negative = interest_payment (editable by user)
    const type: TransactionType = txAmount.sign > 0 ? 'deposit' : 'interest_payment';

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
