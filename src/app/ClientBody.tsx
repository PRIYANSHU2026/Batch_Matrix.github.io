"use client";

import { BatchProvider } from '@/contexts/BatchContext';
import BatchCalculator from '@/components/layout/BatchCalculator';
import TestElementInput from '@/components/forms/TestElementInput';
import AdvancedCalculations from '@/components/layout/AdvancedCalculations';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ClientBody() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 dark:from-slate-950 dark:to-blue-950">
      <div className="container py-6 md:py-12">
        <BatchProvider>
          <Tabs defaultValue="calculator">
            <TabsList className="mb-4">
              <TabsTrigger value="calculator">Batch Calculator</TabsTrigger>
              <TabsTrigger value="advancedCalc">Advanced Calculations</TabsTrigger>
              <TabsTrigger value="testFormulas">Test Element Input</TabsTrigger>
            </TabsList>

            <TabsContent value="calculator">
              <BatchCalculator />
            </TabsContent>

            <TabsContent value="advancedCalc">
              <AdvancedCalculations />
            </TabsContent>

            <TabsContent value="testFormulas">
              <div className="mt-4 space-y-6">
                <TestElementInput />
              </div>
            </TabsContent>
          </Tabs>
        </BatchProvider>
      </div>
    </main>
  );
}
