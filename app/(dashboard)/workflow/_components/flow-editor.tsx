"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Network, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface FlowEditorProps {
  initialConfig: {
    steps: any[];
  };
  onChange: (config: any) => void;
}

export function FlowEditor({ initialConfig, onChange }: FlowEditorProps) {
  const [steps, setSteps] = useState(initialConfig.steps || []);

  const addStep = () => {
    const newStep = {
      id: `step-${Date.now()}`,
      type: "basic",
      name: `Etapa ${steps.length + 1}`,
      config: {},
    };
    
    const updatedSteps = [...steps, newStep];
    setSteps(updatedSteps);
    onChange({ steps: updatedSteps });
  };

  const removeStep = (id: string) => {
    const updatedSteps = steps.filter(step => step.id !== id);
    setSteps(updatedSteps);
    onChange({ steps: updatedSteps });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-md font-medium flex items-center">
          <Network className="h-4 w-4 mr-2 text-primary" />
          Etapas do Fluxo
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={addStep}
          className="flex items-center gap-2"
        >
          <Plus className="h-3.5 w-3.5" />
          Adicionar Etapa
        </Button>
      </div>

      {steps.length === 0 ? (
        <div className="flex items-center justify-center h-32 border rounded-md p-4 bg-muted/40 text-muted-foreground">
          Nenhuma etapa definida. Clique em "Adicionar Etapa" para começar.
        </div>
      ) : (
        <div className="space-y-3">
          {steps.map((step, index) => (
            <Card key={step.id} className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6"
                onClick={() => removeStep(step.id)}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
              <CardHeader className="py-3">
                <CardTitle className="text-sm font-medium flex items-center">
                  {index + 1}. {step.name}
                </CardTitle>
              </CardHeader>
              <Separator />
              <CardContent className="py-3 text-xs text-muted-foreground">
                Tipo: {step.type} - Configuração simplificada
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 