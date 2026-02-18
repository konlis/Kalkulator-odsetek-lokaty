import type { TransactionType } from '@/types';

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  capital_deposit: 'Wpłata kapitału',
  capital_repayment: 'Spłata kapitału',
  interest_payment: 'Płatność odsetek',
  mixed_payment: 'Płatność mieszana',
};

export const TRANSACTION_TYPE_COLORS: Record<TransactionType, string> = {
  capital_deposit: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  capital_repayment: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  interest_payment: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  mixed_payment: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
};

export const DEFAULT_LOAN_CONFIG = {
  initialCapital: 150000,
  annualInterestRate: 14,
  startDate: new Date().toISOString().slice(0, 10),
};

export const STORAGE_KEY = 'kalkulator-pozyczki-state';
export const STORAGE_VERSION = 1;

export const APP_TITLE = 'Kalkulator Pożyczki Inwestorskiej';
