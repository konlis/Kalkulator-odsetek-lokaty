import type { TransactionType, CapitalizationType } from '@/types';

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  deposit: 'Wpłata',
  interest_payment: 'Wypłata odsetek',
  capital_repayment: 'Wypłata kapitału',
};

export const TRANSACTION_TYPE_COLORS: Record<TransactionType, string> = {
  deposit: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  interest_payment: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  capital_repayment: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
};

export const DEFAULT_LOAN_CONFIG = {
  initialCapital: 150000,
  annualInterestRate: 14,
  startDate: new Date().toISOString().slice(0, 10),
  capitalization: 'none' as CapitalizationType,
};

export const CAPITALIZATION_LABELS: Record<CapitalizationType, string> = {
  none: 'Brak (odsetki proste)',
  daily: 'Dzienna',
  monthly: 'Miesięczna',
  yearly: 'Roczna',
};

export const STORAGE_KEY = 'kalkulator-pozyczki-state';
export const STORAGE_VERSION = 1;

export const APP_TITLE = 'Kalkulator Pożyczki Inwestorskiej';
