import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLoanStore } from '@/hooks/use-loan-store';
import { validateTransaction } from '@/lib/validators';
import { TRANSACTION_TYPE_LABELS } from '@/constants';
import type { Transaction, TransactionType } from '@/types';
import { toast } from 'sonner';

interface TransactionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editTransaction?: Transaction | null;
}

const emptyForm = {
  date: new Date().toISOString().slice(0, 10),
  type: 'interest_payment' as TransactionType,
  amount: 0,
  note: '',
};

export function TransactionForm({ open, onOpenChange, editTransaction }: TransactionFormProps) {
  const { state, dispatch } = useLoanStore();
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (editTransaction) {
      setForm({
        date: editTransaction.date,
        type: editTransaction.type,
        amount: editTransaction.amount,
        note: editTransaction.note ?? '',
      });
    } else {
      setForm(emptyForm);
    }
  }, [editTransaction, open]);

  const handleSubmit = () => {
    const errors = validateTransaction(form, state.config);
    if (errors.length > 0) {
      toast.error(errors[0].message);
      return;
    }

    const tx: Transaction = {
      id: editTransaction?.id ?? crypto.randomUUID(),
      date: form.date,
      type: form.type,
      amount: form.amount,
      ...(form.note ? { note: form.note } : {}),
    };

    if (editTransaction) {
      dispatch({ type: 'UPDATE_TRANSACTION', payload: tx });
      toast.success('Transakcja zaktualizowana');
    } else {
      dispatch({ type: 'ADD_TRANSACTION', payload: tx });
      toast.success('Transakcja dodana');
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editTransaction ? 'Edytuj transakcję' : 'Dodaj transakcję'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tx-date">Data</Label>
            <Input
              id="tx-date"
              type="date"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label>Typ transakcji</Label>
            <Select
              value={form.type}
              onValueChange={(val: TransactionType) => setForm((f) => ({ ...f, type: val }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(TRANSACTION_TYPE_LABELS) as [TransactionType, string][]).map(
                  ([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tx-amount">Kwota (PLN)</Label>
            <Input
              id="tx-amount"
              type="number"
              min={0}
              step={100}
              value={form.amount || ''}
              onChange={(e) =>
                setForm((f) => ({ ...f, amount: parseFloat(e.target.value) || 0 }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tx-note">Notatka (opcjonalnie)</Label>
            <Input
              id="tx-note"
              value={form.note}
              onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
              placeholder="np. przelew bankowy"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Anuluj
          </Button>
          <Button onClick={handleSubmit}>
            {editTransaction ? 'Zapisz' : 'Dodaj'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
