import { useMemo } from 'react';
import { simulateLoan } from '@/lib/calculation-engine';
import { useLoanStore } from './use-loan-store';
import type { SimulationResult } from '@/types';

export function useCalculation(): SimulationResult {
  const { activeLoan } = useLoanStore();

  return useMemo(
    () => simulateLoan(activeLoan.config, activeLoan.transactions),
    [activeLoan.config, activeLoan.transactions]
  );
}
