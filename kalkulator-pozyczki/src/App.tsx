import { Header } from '@/components/layout/Header';
import { LoanSetup } from '@/components/loan/LoanSetup';
import { TransactionList } from '@/components/loan/TransactionList';
import { SummaryCards } from '@/components/results/SummaryCards';
import { InterestBreakdown } from '@/components/results/InterestBreakdown';
import { Timeline } from '@/components/results/Timeline';
import { DetailTable } from '@/components/results/DetailTable';
import { ExportButtons } from '@/components/export/ExportButtons';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="container mx-auto px-4 py-6 space-y-6">
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
