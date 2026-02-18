import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { LoanConfig, LoanState, Transaction } from '@/types';
import { loadState, saveState } from '@/lib/storage';

type LoanAction =
  | { type: 'SET_CONFIG'; payload: LoanConfig }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'UPDATE_TRANSACTION'; payload: Transaction }
  | { type: 'DELETE_TRANSACTION'; payload: string }
  | { type: 'RESET' };

function loanReducer(state: LoanState, action: LoanAction): LoanState {
  switch (action.type) {
    case 'SET_CONFIG':
      return { ...state, config: action.payload };
    case 'ADD_TRANSACTION':
      return {
        ...state,
        transactions: [...state.transactions, action.payload].sort(
          (a, b) => a.date.localeCompare(b.date)
        ),
      };
    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions
          .map((tx) => (tx.id === action.payload.id ? action.payload : tx))
          .sort((a, b) => a.date.localeCompare(b.date)),
      };
    case 'DELETE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.filter((tx) => tx.id !== action.payload),
      };
    case 'RESET':
      return loadState();
    default:
      return state;
  }
}

interface LoanContextValue {
  state: LoanState;
  dispatch: React.Dispatch<LoanAction>;
}

const LoanContext = createContext<LoanContextValue | null>(null);

export function LoanProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(loanReducer, null, loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  return (
    <LoanContext.Provider value={{ state, dispatch }}>
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
