import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { LoanConfig, AppState, Loan, Transaction } from '@/types';
import { loadState, saveState, getDefaultState } from '@/lib/storage';
import { DEFAULT_LOAN_CONFIG } from '@/constants';

type LoanAction =
  | { type: 'SET_CONFIG'; payload: LoanConfig }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'UPDATE_TRANSACTION'; payload: Transaction }
  | { type: 'DELETE_TRANSACTION'; payload: string }
  | { type: 'RESET' }
  | { type: 'ADD_LOAN'; payload?: { name?: string; currency?: 'PLN' | 'USD' } }
  | { type: 'DELETE_LOAN'; payload: string }
  | { type: 'SET_ACTIVE_LOAN'; payload: string }
  | { type: 'RENAME_LOAN'; payload: { id: string; name: string } };

function updateActiveLoan(state: AppState, updater: (loan: Loan) => Loan): AppState {
  return {
    ...state,
    loans: state.loans.map((loan) =>
      loan.id === state.activeLoanId ? updater(loan) : loan
    ),
  };
}

function loanReducer(state: AppState, action: LoanAction): AppState {
  switch (action.type) {
    case 'SET_CONFIG':
      return updateActiveLoan(state, (loan) => ({
        ...loan,
        config: action.payload,
      }));

    case 'ADD_TRANSACTION':
      return updateActiveLoan(state, (loan) => ({
        ...loan,
        transactions: [...loan.transactions, action.payload].sort(
          (a, b) => a.date.localeCompare(b.date)
        ),
      }));

    case 'UPDATE_TRANSACTION':
      return updateActiveLoan(state, (loan) => ({
        ...loan,
        transactions: loan.transactions
          .map((tx) => (tx.id === action.payload.id ? action.payload : tx))
          .sort((a, b) => a.date.localeCompare(b.date)),
      }));

    case 'DELETE_TRANSACTION':
      return updateActiveLoan(state, (loan) => ({
        ...loan,
        transactions: loan.transactions.filter((tx) => tx.id !== action.payload),
      }));

    case 'ADD_LOAN': {
      const newId = crypto.randomUUID();
      const currency = action.payload?.currency ?? 'PLN';
      const name = action.payload?.name ?? `Pożyczka ${state.loans.length + 1}`;
      return {
        ...state,
        loans: [
          ...state.loans,
          {
            id: newId,
            name,
            config: { ...DEFAULT_LOAN_CONFIG, currency },
            transactions: [],
          },
        ],
        activeLoanId: newId,
      };
    }

    case 'DELETE_LOAN': {
      if (state.loans.length <= 1) return state;
      const remaining = state.loans.filter((l) => l.id !== action.payload);
      const newActiveId =
        state.activeLoanId === action.payload
          ? remaining[0].id
          : state.activeLoanId;
      return {
        ...state,
        loans: remaining,
        activeLoanId: newActiveId,
      };
    }

    case 'SET_ACTIVE_LOAN':
      return { ...state, activeLoanId: action.payload };

    case 'RENAME_LOAN':
      return {
        ...state,
        loans: state.loans.map((loan) =>
          loan.id === action.payload.id
            ? { ...loan, name: action.payload.name }
            : loan
        ),
      };

    case 'RESET':
      return getDefaultState();

    default:
      return state;
  }
}

interface LoanContextValue {
  state: AppState;
  dispatch: React.Dispatch<LoanAction>;
  activeLoan: Loan;
}

const LoanContext = createContext<LoanContextValue | null>(null);

export function LoanProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(loanReducer, null, loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const activeLoan = state.loans.find((l) => l.id === state.activeLoanId) ?? state.loans[0];

  return (
    <LoanContext.Provider value={{ state, dispatch, activeLoan }}>
      {children}
    </LoanContext.Provider>
  );
}

export function useLoanStore() {
  const context = useContext(LoanContext);
  if (!context) {
    throw new Error('useLoanStore must be used within LoanProvider');
  }
  return context;
}
