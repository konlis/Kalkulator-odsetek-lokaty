import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { LoanSetup } from '@/components/loan/LoanSetup';
import { TransactionList } from '@/components/loan/TransactionList';
import { SummaryCards } from '@/components/results/SummaryCards';
import { InterestBreakdown } from '@/components/results/InterestBreakdown';
import { Timeline } from '@/components/results/Timeline';
import { DetailTable } from '@/components/results/DetailTable';
import { ExportButtons } from '@/components/export/ExportButtons';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLoanStore } from '@/hooks/use-loan-store';
import { Plus, X, Pencil, Check } from 'lucide-react';

function LoanTabs() {
  const { state, dispatch } = useLoanStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const startRename = (id: string, name: string) => {
    setEditingId(id);
    setEditName(name);
  };

  const confirmRename = () => {
    if (editingId && editName.trim()) {
      dispatch({ type: 'RENAME_LOAN', payload: { id: editingId, name: editName.trim() } });
    }
    setEditingId(null);
  };

  const handleDelete = (id: string, name: string) => {
    if (state.loans.length <= 1) return;
    if (confirm(`Usunąć pożyczkę "${name}"?`)) {
      dispatch({ type: 'DELETE_LOAN', payload: id });
    }
  };

  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-2 border-b mb-4">
      {state.loans.map((loan) => (
        <div
          key={loan.id}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-t-md text-sm cursor-pointer border border-b-0 transition-colors ${
            loan.id === state.activeLoanId
              ? 'bg-background font-medium border-border'
              : 'bg-muted/50 text-muted-foreground border-transparent hover:bg-muted'
          }`}
        >
          {editingId === loan.id ? (
            <form
              onSubmit={(e) => { e.preventDefault(); confirmRename(); }}
              className="flex items-center gap-1"
            >
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="h-6 w-28 text-sm px-1"
                autoFocus
                onBlur={confirmRename}
              />
              <button type="submit" className="p-0.5 hover:text-foreground">
                <Check className="h-3 w-3" />
              </button>
            </form>
          ) : (
            <>
              <span
                onClick={() => dispatch({ type: 'SET_ACTIVE_LOAN', payload: loan.id })}
                className="select-none"
              >
                {loan.name}
              </span>
              {loan.id === state.activeLoanId && (
                <>
                  <button
                    onClick={() => startRename(loan.id, loan.name)}
                    className="p-0.5 hover:text-foreground text-muted-foreground"
                    title="Zmień nazwę"
                  >
                    <Pencil className="h-3 w-3" />
                  </button>
                  {state.loans.length > 1 && (
                    <button
                      onClick={() => handleDelete(loan.id, loan.name)}
                      className="p-0.5 hover:text-destructive text-muted-foreground"
                      title="Usuń pożyczkę"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </>
              )}
            </>
          )}
        </div>
      ))}
      <Button
        variant="ghost"
        size="sm"
        className="h-7 w-7 p-0 shrink-0"
        onClick={() => dispatch({ type: 'ADD_LOAN' })}
        title="Dodaj pożyczkę"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="container mx-auto px-4 py-6 space-y-6">
        <LoanTabs />
        <SummaryCards />

        <Tabs defaultValue="setup" className="w-full">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <TabsList>
              <TabsTrigger value="setup">Konfiguracja</TabsTrigger>
              <TabsTrigger value="transactions">Transakcje</TabsTrigger>
              <TabsTrigger value="results">Wyniki</TabsTrigger>
            </TabsList>
            <ExportButtons />
          </div>

          <TabsContent value="setup" className="space-y-6 mt-4">
            <LoanSetup />
            <InterestBreakdown />
          </TabsContent>

          <TabsContent value="transactions" className="mt-4">
            <TransactionList />
          </TabsContent>

          <TabsContent value="results" className="space-y-6 mt-4">
            <Timeline />
            <DetailTable />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

export default App;
