import { addDays, differenceInDays, parseISO, format } from 'date-fns';
import type {
  LoanConfig,
  Transaction,
  DayEvent,
  LoanSummary,
  TimelinePoint,
  SimulationResult,
  CapitalizationType,
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

function shouldCapitalize(
  capitalization: CapitalizationType,
  currentDate: Date,
  prevDate: Date,
): boolean {
  if (capitalization === 'none') return false;
  if (capitalization === 'daily') return true;
  if (capitalization === 'monthly') {
    return currentDate.getMonth() !== prevDate.getMonth() ||
           currentDate.getFullYear() !== prevDate.getFullYear();
  }
  if (capitalization === 'yearly') {
    return currentDate.getFullYear() !== prevDate.getFullYear();
  }
  return false;
}

export function simulateLoan(config: LoanConfig, transactions: Transaction[]): SimulationResult {
  const startDate = parseISO(config.startDate);
  const endDate = config.endDate ? parseISO(config.endDate) : new Date();
  const totalDays = differenceInDays(endDate, startDate);
  const capitalization = config.capitalization ?? 'none';

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
  let totalDeposited = config.initialCapital;
  let totalWithdrawn = 0;
  let totalCapitalizedInterest = 0;

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
    transactionType: 'deposit',
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
    const prevDate = addDays(startDate, day - 1);
    const dateStr = format(currentDate, 'yyyy-MM-dd');

    const principalBefore = principal;
    const accruedInterestBefore = accruedInterest;

    // 1. Capitalize interest if applicable
    if (shouldCapitalize(capitalization, currentDate, prevDate) && accruedInterest > 0) {
      const capitalized = accruedInterest;
      principal += capitalized;
      totalCapitalizedInterest += capitalized;
      accruedInterest = 0;
    }

    // 2. Accrue daily interest on current principal
    const dailyInterest = principal * dailyRate;
    accruedInterest += dailyInterest;

    // 3. Process transactions
    const dayTransactions = txByDate.get(dateStr);

    if (dayTransactions) {
      for (const tx of dayTransactions) {
        switch (tx.type) {
          case 'deposit':
            principal += tx.amount;
            totalDeposited += tx.amount;
            break;
          case 'withdrawal':
            accruedInterest -= tx.amount;
            totalWithdrawn += tx.amount;
            break;
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

    // Add timeline point
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
    totalDeposited,
    totalWithdrawn,
    totalOwed: principal + accruedInterest,
    daysElapsed: totalDays,
    dailyInterestRate: dailyRate,
    totalCapitalizedInterest,
  };

  return { events, summary, timeline };
}

function emptySummary(config: LoanConfig): LoanSummary {
  return {
    currentPrincipal: config.initialCapital,
    totalAccruedInterest: 0,
    totalDeposited: config.initialCapital,
    totalWithdrawn: 0,
    totalOwed: config.initialCapital,
    daysElapsed: 0,
    dailyInterestRate: config.annualInterestRate / 100 / 365,
    totalCapitalizedInterest: 0,
  };
}
