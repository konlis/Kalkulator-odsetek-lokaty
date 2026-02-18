import type { LoanState } from '@/types';
import { STORAGE_KEY, STORAGE_VERSION, DEFAULT_LOAN_CONFIG } from '@/constants';

export function getDefaultState(): LoanState {
  return {
    version: STORAGE_VERSION,
    config: { ...DEFAULT_LOAN_CONFIG },
    transactions: [],
  };
}

export function loadState(): LoanState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultState();

    const parsed = JSON.parse(raw) as LoanState;
    if (parsed.version !== STORAGE_VERSION) {
      return getDefaultState();
    }
    // Backward compat: add capitalization if missing
    if (!parsed.config.capitalization) {
      parsed.config.capitalization = 'none';
    }
    // Migrate old transaction types
    for (const tx of parsed.transactions) {
      const oldType = tx.type as string;
      if (oldType === 'capital_deposit') {
        tx.type = 'deposit';
      } else if (oldType !== 'deposit') {
        tx.type = 'withdrawal';
      }
    }
    return parsed;
  } catch {
    return getDefaultState();
  }
}

export function saveState(state: LoanState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage full or unavailable
  }
}
