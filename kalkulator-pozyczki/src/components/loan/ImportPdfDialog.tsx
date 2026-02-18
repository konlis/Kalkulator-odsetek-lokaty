import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLoanStore } from '@/hooks/use-loan-store';
import { TRANSACTION_TYPE_LABELS } from '@/constants';
import { formatPLN, formatDatePL } from '@/lib/formatters';
import { extractTextFromPdf, parseSantanderText } from '@/lib/import-santander';
import type { ParsedTransaction } from '@/lib/import-santander';
import type { TransactionType } from '@/types';
import { Upload, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ImportPdfDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportPdfDialog({ open, onOpenChange }: ImportPdfDialogProps) {
  const { dispatch } = useLoanStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [parsed, setParsed] = useState<ParsedTransaction[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [types, setTypes] = useState<TransactionType[]>([]);
  const [fileName, setFileName] = useState('');

  const reset = () => {
    setParsed([]);
    setSelected(new Set());
    setTypes([]);
    setFileName('');
    setLoading(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setFileName(file.name);

    try {
      const text = await extractTextFromPdf(file);
      const transactions = parseSantanderText(text);

      if (transactions.length === 0) {
        toast.error('Nie znaleziono transakcji w pliku PDF');
        reset();
        return;
      }

      setParsed(transactions);
      setSelected(new Set(transactions.map((_, i) => i)));
      setTypes(transactions.map((t) => t.type));
    } catch {
      toast.error('Błąd podczas odczytu pliku PDF');
      reset();
    } finally {
      setLoading(false);
    }

    // Reset file input so the same file can be re-selected
    e.target.value = '';
  };

  const toggleSelect = (index: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === parsed.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(parsed.map((_, i) => i)));
    }
  };

  const changeType = (index: number, type: TransactionType) => {
    setTypes((prev) => {
      const next = [...prev];
      next[index] = type;
      return next;
    });
  };

  const handleImport = () => {
    let count = 0;
    for (const index of selected) {
      const tx = parsed[index];
      const type = types[index];
      dispatch({
        type: 'ADD_TRANSACTION',
        payload: {
          id: crypto.randomUUID(),
          date: tx.date,
          type,
          amount: tx.amount,
          note: tx.title || tx.note,
        },
      });
      count++;
    }

    toast.success(`Zaimportowano ${count} transakcji`);
    reset();
    onOpenChange(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) reset();
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Importuj wyciąg PDF Santander
          </DialogTitle>
          <DialogDescription>
            Wczytaj wyciąg bankowy z Santandera, aby zaimportować transakcje.
          </DialogDescription>
        </DialogHeader>

        {parsed.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-8">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={handleFileChange}
            />
            {loading ? (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p>Przetwarzanie pliku...</p>
              </div>
            ) : (
              <>
                <Upload className="h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground text-center">
                  Wybierz plik PDF z wyciągiem bankowym Santandera
                </p>
                <Button onClick={() => fileInputRef.current?.click()}>
                  <Upload className="mr-2 h-4 w-4" />
                  Wybierz plik PDF
                </Button>
              </>
            )}
          </div>
        ) : (
          <>
            <div className="text-sm text-muted-foreground">
              Plik: {fileName} — Znaleziono {parsed.length} transakcji, zaznaczono {selected.size}
            </div>

            <div className="overflow-auto flex-1 border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <input
                        type="checkbox"
                        checked={selected.size === parsed.length}
                        onChange={toggleAll}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                    </TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Kwota</TableHead>
                    <TableHead>Typ</TableHead>
                    <TableHead className="hidden md:table-cell">Tytuł</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsed.map((tx, i) => (
                    <TableRow key={i} className={selected.has(i) ? '' : 'opacity-50'}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selected.has(i)}
                          onChange={() => toggleSelect(i)}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {formatDatePL(tx.date)}
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        {formatPLN(tx.amount)}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={types[i]}
                          onValueChange={(val: TransactionType) => changeType(i, val)}
                        >
                          <SelectTrigger className="w-[180px]" size="sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {(
                              Object.entries(TRANSACTION_TYPE_LABELS) as [TransactionType, string][]
                            ).map(([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground max-w-[200px] truncate">
                        {tx.title || tx.note}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => { reset(); }}>
                Zmień plik
              </Button>
              <Button onClick={handleImport} disabled={selected.size === 0}>
                Importuj {selected.size > 0 ? `(${selected.size})` : ''}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
