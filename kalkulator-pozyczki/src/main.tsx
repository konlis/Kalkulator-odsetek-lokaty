import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import { LoanProvider } from '@/hooks/use-loan-store';
import { Toaster } from '@/components/ui/sonner';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <LoanProvider>
        <App />
        <Toaster />
      </LoanProvider>
    </ThemeProvider>
  </StrictMode>,
);
