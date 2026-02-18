import type { LoanConfig, Transaction } from '@/types';

export interface ValidationError {
  field: string;
  message: string;
}

export function validateLoanConfig(config: Partial<LoanConfig>): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!config.initialCapital || config.initialCapital <= 0) {
    errors.push({ field: 'initialCapital', message: 'Kapitał musi być większy od 0' });
  }

  if (!config.annualInterestRate || config.annualInterestRate <= 0 || config.annualInterestRate > 100) {
    errors.push({ field: 'annualInterestRate', message: 'Stopa procentowa musi być między 0 a 100' });
  }

  if (!config.startDate) {
    errors.push({ field: 'startDate', message: 'Data rozpoczęcia jest wymagana' });
  }

  if (config.endDate && config.startDate && config.endDate < config.startDate) {
    errors.push({ field: 'endDate', message: 'Data końcowa nie może być wcześniejsza niż data rozpoczęcia' });
  }

  return errors;
}

export function validateTransaction(
  tx: Partial<Transaction>,
  config: LoanConfig
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!tx.date) {
    errors.push({ field: 'date', message: 'Data jest wymagana' });
  } else if (tx.date < config.startDate) {
    errors.push({ field: 'date', message: 'Data nie może być wcześniejsza niż data rozpoczęcia pożyczki' });
  }

  if (!tx.amount || tx.amount <= 0) {
    errors.push({ field: 'amount', message: 'Kwota musi być większa od 0' });
  }

  return errors;
}
