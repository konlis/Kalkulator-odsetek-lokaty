import { format, parseISO } from 'date-fns';
import { pl } from 'date-fns/locale';
import type { Currency } from '@/types';

export function formatCurrency(amount: number, currency: Currency): string {
  const locale = currency === 'PLN' ? 'pl-PL' : 'en-US';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatPLN(amount: number): string {
  return formatCurrency(amount, 'PLN');
}

export function formatDatePL(dateStr: string): string {
  return format(parseISO(dateStr), 'd MMM yyyy', { locale: pl });
}

export function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

export function formatNumber(value: number, decimals = 2): string {
  return new Intl.NumberFormat('pl-PL', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}
