import { useMemo } from 'react';
import { simulateLoan } from '@/lib/calculation-engine';
import { useLoanStore } from './use-loan-store';
import type { SimulationResult } from '@/types';

export function useCalculation(): SimulationResult {
  const { state } = useLoanStore();

  return useMemo(
    () => simulateLoan(state.config, state.transactions),
    [state.config, state.transactions]
  );
}
