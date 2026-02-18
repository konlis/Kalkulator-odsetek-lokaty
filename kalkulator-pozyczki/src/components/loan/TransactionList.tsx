import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useLoanStore } from '@/hooks/use-loan-store';
import { TransactionTypeBadge } from './TransactionTypeBadge';
import { TransactionForm } from './TransactionForm';
import { formatPLN, formatDatePL } from '@/lib/formatters';
import { Plus, Pencil, Trash2, List } from 'lucide-react';
import { toast } from 'sonner';
import type { Transaction } from '@/types';

export function TransactionList() {
  const { state, dispatch } = useLoanStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTx, setEditTx] = useState<Transaction | null>(null);

  const handleAdd = () => {
    setEditTx(null);
    setDialogOpen(true);
  };

  const handleEdit = (tx: Transaction) => {
    setEditTx(tx);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    dispatch({ type: 'DELETE_TRANSACTION', payload: id });
    toast.success('Transakcja usunięta');
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <List className="h-5 w-5" />
              Transakcje ({state.transactions.length})
            </CardTitle>
            <Button size="sm" onClick={handleAdd}>
              <Plus className="mr-1 h-4 w-4" />
              Dodaj
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {state.transactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Brak transakcji. Kliknij &quot;Dodaj&quot; aby dodać pierwszą transakcję.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Typ</TableHead>
                    <TableHead className="text-right">Kwota</TableHead>
                    <TableHead className="hidden sm:table-cell">Notatka</TableHead>
                    <TableHead className="text-right">Akcje</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {state.transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="whitespace-nowrap">
                        {formatDatePL(tx.date)}
                      </TableCell>
                      <TableCell>
                        <TransactionTypeBadge type={tx.type} />
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        {formatPLN(tx.amount)}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground max-w-[200px] truncate">
                        {tx.note || '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(tx)}
                            aria-label="Edytuj"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(tx.id)}
                            aria-label="Usuń"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <TransactionForm
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editTransaction={editTx}
      />
    </>
  );
}
