export type TransactionType = 'deposit' | 'withdrawal';

export type CapitalizationType = 'none' | 'daily' | 'monthly' | 'yearly';

export interface Transaction {
  id: string;
  date: string; // 'YYYY-MM-DD'
  type: TransactionType;
  amount: number; // Always positive
  note?: string;
}

export type Currency = 'PLN' | 'USD';

export interface LoanConfig {
  initialCapital: number;
  annualInterestRate: number; // e.g. 14 for 14%
  startDate: string; // 'YYYY-MM-DD'
  endDate?: string; // Defaults to today
  capitalization: CapitalizationType; // Interest compounding frequency
  currency: Currency;
}

export interface Loan {
  id: string;
  name: string;
  config: LoanConfig;
  transactions: Transaction[];
}

export interface AppState {
  version: number;
  loans: Loan[];
  activeLoanId: string;
}

export interface DayEvent {
  date: string;
  principalBefore: number;
  accruedInterestBefore: number;
  dailyInterest: number;
  transactionType?: TransactionType;
  transactionAmount?: number;
  transactionNote?: string;
  principalAfter: number;
  accruedInterestAfter: number;
  totalOwed: number;
}

export interface LoanSummary {
  currentPrincipal: number;
  totalAccruedInterest: number;
  totalDeposited: number;
  totalWithdrawn: number;
  totalOwed: number;
  daysElapsed: number;
  dailyInterestRate: number;
  totalCapitalizedInterest: number;
}

export interface TimelinePoint {
  date: string;
  principal: number;
  accruedInterest: number;
  totalOwed: number;
}

export interface SimulationResult {
  events: DayEvent[];
  summary: LoanSummary;
  timeline: TimelinePoint[];
}
