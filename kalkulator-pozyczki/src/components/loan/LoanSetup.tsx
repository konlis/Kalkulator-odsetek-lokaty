import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLoanStore } from '@/hooks/use-loan-store';
import { validateLoanConfig } from '@/lib/validators';
import { CAPITALIZATION_LABELS } from '@/constants';
import type { CapitalizationType, Currency } from '@/types';
import { Settings } from 'lucide-react';
import { toast } from 'sonner';

export function LoanSetup() {
  const { activeLoan, dispatch } = useLoanStore();
  const [config, setConfig] = useState(activeLoan.config);

  const handleSave = () => {
    const errors = validateLoanConfig(config);
    if (errors.length > 0) {
      toast.error(errors[0].message);
      return;
    }
    dispatch({ type: 'SET_CONFIG', payload: config });
    toast.success('Konfiguracja zapisana');
  };

  const currencyLabel = config.currency === 'USD' ? 'USD' : 'PLN';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Parametry pożyczki
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="initialCapital">Kapitał początkowy ({currencyLabel})</Label>
            <Input
              id="initialCapital"
              type="number"
              min={0}
              step={1000}
              value={config.initialCapital}
              onChange={(e) =>
                setConfig((c) => ({ ...c, initialCapital: parseFloat(e.target.value) || 0 }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="annualInterestRate">Oprocentowanie roczne (%)</Label>
            <Input
              id="annualInterestRate"
              type="number"
              min={0}
              max={100}
              step={0.1}
              value={config.annualInterestRate}
              onChange={(e) =>
                setConfig((c) => ({ ...c, annualInterestRate: parseFloat(e.target.value) || 0 }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="startDate">Data rozpoczęcia</Label>
            <Input
              id="startDate"
              type="date"
              value={config.startDate}
              onChange={(e) => setConfig((c) => ({ ...c, startDate: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate">Data zakończenia (opcjonalnie)</Label>
            <Input
              id="endDate"
              type="date"
              value={config.endDate ?? ''}
              onChange={(e) =>
                setConfig((c) => ({ ...c, endDate: e.target.value || undefined }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Kapitalizacja odsetek</Label>
            <Select
              value={config.capitalization ?? 'none'}
              onValueChange={(val: CapitalizationType) =>
                setConfig((c) => ({ ...c, capitalization: val }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(CAPITALIZATION_LABELS) as [CapitalizationType, string][]).map(
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
            <Label>Waluta</Label>
            <Select
              value={config.currency ?? 'PLN'}
              onValueChange={(val: Currency) =>
                setConfig((c) => ({ ...c, currency: val }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PLN">PLN (złoty)</SelectItem>
                <SelectItem value="USD">USD (dolar)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button onClick={handleSave} className="w-full sm:w-auto">
          Zapisz konfigurację
        </Button>
      </CardContent>
    </Card>
  );
}
