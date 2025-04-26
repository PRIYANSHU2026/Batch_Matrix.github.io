import { BatchProvider } from '@/contexts/BatchContext';
import BatchCalculator from '@/components/layout/BatchCalculator';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 dark:from-slate-950 dark:to-blue-950">
      <BatchProvider>
        <BatchCalculator />
      </BatchProvider>
    </main>
  );
}
