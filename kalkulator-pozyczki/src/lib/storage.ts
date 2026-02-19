import type { AppState } from '@/types';
import { STORAGE_KEY, STORAGE_VERSION, DEFAULT_LOAN_CONFIG } from '@/constants';

function generateId(): string {
  return crypto.randomUUID();
}

export function getDefaultState(): AppState {
  const loanId = generateId();
  return {
    version: STORAGE_VERSION,
    loans: [
      {
        id: loanId,
        name: 'Pożyczka 1',
        config: { ...DEFAULT_LOAN_CONFIG },
        transactions: [],
      },
    ],
    activeLoanId: loanId,
  };
}

interface LoanStateV1 {
  version: number;
  config: {
    initialCapital: number;
    annualInterestRate: number;
    startDate: string;
    endDate?: string;
    capitalization?: string;
    currency?: string;
  };
  transactions: Array<{
    id: string;
    date: string;
    type: string;
    amount: number;
    note?: string;
  }>;
}

function migrateV1(v1: LoanStateV1): AppState {
  // Backward compat: add capitalization if missing
  if (!v1.config.capitalization) {
    v1.config.capitalization = 'none';
  }
  // Add currency if missing
  if (!v1.config.currency) {
    v1.config.currency = 'PLN';
  }
  // Migrate old transaction types
  for (const tx of v1.transactions) {
    if (tx.type === 'capital_deposit') {
      tx.type = 'deposit';
    } else if (tx.type !== 'deposit') {
      tx.type = 'withdrawal';
    }
  }

  const loanId = generateId();
  return {
    version: STORAGE_VERSION,
    loans: [
      {
        id: loanId,
        name: 'Pożyczka 1',
        config: v1.config as AppState['loans'][0]['config'],
        transactions: v1.transactions as AppState['loans'][0]['transactions'],
      },
    ],
    activeLoanId: loanId,
  };
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultState();

    const parsed = JSON.parse(raw);

    // V1 data: has config/transactions at top level, no loans array
    if (parsed.version === 1 || (!parsed.loans && parsed.config)) {
      return migrateV1(parsed as LoanStateV1);
    }

    if (parsed.version !== STORAGE_VERSION) {
      return getDefaultState();
    }

    // V2: ensure all loans have currency
    for (const loan of parsed.loans) {
      if (!loan.config.currency) {
        loan.config.currency = 'PLN';
      }
      if (!loan.config.capitalization) {
        loan.config.capitalization = 'none';
      }
    }

    // Ensure activeLoanId is valid
    if (!parsed.loans.find((l: { id: string }) => l.id === parsed.activeLoanId)) {
      parsed.activeLoanId = parsed.loans[0]?.id;
    }

    return parsed as AppState;
  } catch {
    return getDefaultState();
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage full or unavailable
  }
}
