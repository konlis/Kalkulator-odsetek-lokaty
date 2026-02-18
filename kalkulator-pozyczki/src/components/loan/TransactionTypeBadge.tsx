import { Badge } from '@/components/ui/badge';
import { TRANSACTION_TYPE_LABELS, TRANSACTION_TYPE_COLORS } from '@/constants';
import type { TransactionType } from '@/types';

interface TransactionTypeBadgeProps {
  type: TransactionType;
}

export function TransactionTypeBadge({ type }: TransactionTypeBadgeProps) {
  return (
    <Badge variant="outline" className={TRANSACTION_TYPE_COLORS[type]}>
      {TRANSACTION_TYPE_LABELS[type]}
    </Badge>
  );
}
