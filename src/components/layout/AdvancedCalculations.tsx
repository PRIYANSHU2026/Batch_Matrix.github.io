"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import MassCalculationCard from "@/components/ui/MassCalculationCard";
import PrecursorMolesCalculationCard from "@/components/ui/PrecursorMolesCalculationCard";

export default function AdvancedCalculations() {
  return (
    <div className="mx-auto px-4 py-10 max-w-7xl">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold leading-tight tracking-tighter mb-2 text-blue-900 dark:text-blue-100">
          Advanced Batch Calculations
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Additional calculation tools using custom formulas for molecular weights, mass percentages, and batch weights.
        </p>
      </header>

      <Tabs defaultValue="molecular">
        <TabsList className="mb-6">
          <TabsTrigger value="molecular">Molecular Weight</TabsTrigger>
          <TabsTrigger value="precursor">Precursor Moles</TabsTrigger>
        </TabsList>

        <TabsContent value="molecular">
          <div className="grid grid-cols-1 gap-8">
            <MassCalculationCard />
          </div>
        </TabsContent>

        <TabsContent value="precursor">
          <div className="grid grid-cols-1 gap-8">
            <PrecursorMolesCalculationCard />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
