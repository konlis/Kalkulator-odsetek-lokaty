import { Button } from '@/components/ui/button';
import { useCalculation } from '@/hooks/use-calculation';
import { useLoanStore } from '@/hooks/use-loan-store';
import { downloadPDF } from '@/lib/export-pdf';
import { downloadCSV } from '@/lib/export-csv';
import { FileText, Sheet } from 'lucide-react';
import { toast } from 'sonner';

export function ExportButtons() {
  const { events, summary } = useCalculation();
  const { activeLoan } = useLoanStore();

  const handlePDF = () => {
    try {
      downloadPDF(events, summary, activeLoan.config);
      toast.success('PDF wygenerowany');
    } catch {
      toast.error('Błąd generowania PDF');
    }
  };

  const handleCSV = () => {
    try {
      downloadCSV(events, summary, activeLoan.config.currency);
      toast.success('CSV wygenerowany');
    } catch {
      toast.error('Błąd generowania CSV');
    }
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={handlePDF}>
        <FileText className="mr-1 h-4 w-4" />
        PDF
      </Button>
      <Button variant="outline" size="sm" onClick={handleCSV}>
        <Sheet className="mr-1 h-4 w-4" />
        CSV
      </Button>
    </div>
  );
}
