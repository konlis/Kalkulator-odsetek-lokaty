import { addDays, differenceInDays, parseISO, format } from 'date-fns';
import type {
  LoanConfig,
  Transaction,
  DayEvent,
  LoanSummary,
  TimelinePoint,
  SimulationResult,
} from '@/types';

function groupTransactionsByDate(transactions: Transaction[]): Map<string, Transaction[]> {
  const map = new Map<string, Transaction[]>();
  for (const tx of transactions) {
    const existing = map.get(tx.date);
    if (existing) {
      existing.push(tx);
    } else {
      map.set(tx.date, [tx]);
    }
  }
  return map;
}

export function simulateLoan(config: LoanConfig, transactions: Transaction[]): SimulationResult {
  const startDate = parseISO(config.startDate);
  const endDate = config.endDate ? parseISO(config.endDate) : new Date();
  const totalDays = differenceInDays(endDate, startDate);

  if (totalDays < 0) {
    return {
      events: [],
      summary: emptySummary(config),
      timeline: [],
    };
  }

  const txByDate = groupTransactionsByDate(transactions);
  const dailyRate = config.annualInterestRate / 100 / 365;

  let principal = config.initialCapital;
  let accruedInterest = 0;
  let totalInterestPaid = 0;
  let totalCapitalRepaid = 0;
  let totalCapitalDeposited = config.initialCapital;

  const events: DayEvent[] = [];
  const timeline: TimelinePoint[] = [];

  // Start event
  const startDateStr = format(startDate, 'yyyy-MM-dd');
  events.push({
    date: startDateStr,
    principalBefore: 0,
    accruedInterestBefore: 0,
    dailyInterest: 0,
    principalAfter: principal,
    accruedInterestAfter: 0,
    totalOwed: principal,
    transactionType: 'capital_deposit',
    transactionAmount: config.initialCapital,
    transactionNote: 'Kapitał początkowy',
  });
  timeline.push({
    date: startDateStr,
    principal,
    accruedInterest: 0,
    totalOwed: principal,
  });

  for (let day = 1; day <= totalDays; day++) {
    const currentDate = addDays(startDate, day);
    const dateStr = format(currentDate, 'yyyy-MM-dd');

    const principalBefore = principal;
    const accruedInterestBefore = accruedInterest;

    // Accrue daily interest on principal only
    const dailyInterest = principal * dailyRate;
    accruedInterest += dailyInterest;

    const dayTransactions = txByDate.get(dateStr);

    if (dayTransactions) {
      for (const tx of dayTransactions) {
        switch (tx.type) {
          case 'capital_deposit':
            principal += tx.amount;
            totalCapitalDeposited += tx.amount;
            break;
          case 'capital_repayment':
            principal = Math.max(0, principal - tx.amount);
            totalCapitalRepaid += tx.amount;
            break;
          case 'interest_payment':
            accruedInterest = Math.max(0, accruedInterest - tx.amount);
            totalInterestPaid += tx.amount;
            break;
          case 'mixed_payment': {
            const interestPart = tx.interestPortion ?? 0;
            const capitalPart = tx.capitalPortion ?? 0;
            accruedInterest = Math.max(0, accruedInterest - interestPart);
            totalInterestPaid += interestPart;
            principal = Math.max(0, principal - capitalPart);
            totalCapitalRepaid += capitalPart;
            break;
          }
        }

        events.push({
          date: dateStr,
          principalBefore,
          accruedInterestBefore,
          dailyInterest,
          transactionType: tx.type,
          transactionAmount: tx.amount,
          transactionNote: tx.note,
          principalAfter: principal,
          accruedInterestAfter: accruedInterest,
          totalOwed: principal + accruedInterest,
        });
      }
    }

    // Add timeline point (sample: every day if <=365, every 7 days if more, always on tx days and last day)
    const shouldAddTimeline =
      dayTransactions ||
      day === totalDays ||
      totalDays <= 365 ||
      day % 7 === 0;

    if (shouldAddTimeline) {
      timeline.push({
        date: dateStr,
        principal,
        accruedInterest,
        totalOwed: principal + accruedInterest,
      });
    }
  }

  const summary: LoanSummary = {
    currentPrincipal: principal,
    totalAccruedInterest: accruedInterest,
    totalInterestPaid,
    totalCapitalRepaid,
    totalCapitalDeposited,
    totalOwed: principal + accruedInterest,
    daysElapsed: totalDays,
    dailyInterestRate: dailyRate,
  };

  return { events, summary, timeline };
}

function emptySummary(config: LoanConfig): LoanSummary {
  return {
    currentPrincipal: config.initialCapital,
    totalAccruedInterest: 0,
    totalInterestPaid: 0,
    totalCapitalRepaid: 0,
    totalCapitalDeposited: config.initialCapital,
    totalOwed: config.initialCapital,
    daysElapsed: 0,
    dailyInterestRate: config.annualInterestRate / 100 / 365,
  };
}
