"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

const appearanceFormSchema = z.object({
  theme: z.enum(["light", "dark", "system"], {
    required_error: "Por favor, selecione um tema",
  }),
  language: z.enum(["pt-BR", "en-US"], {
    required_error: "Por favor, selecione um idioma",
  }),
});

type AppearanceFormValues = z.infer<typeof appearanceFormSchema>;

interface AppearanceSettingsProps {
  userId: string;
}

export function AppearanceSettings({ userId }: AppearanceSettingsProps) {
  const { setTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<AppearanceFormValues>({
    resolver: zodResolver(appearanceFormSchema),
    defaultValues: {
      theme: "system",
      language: "pt-BR",
    },
  });

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("user_settings")
          .select("theme, language")
          .eq("user_id", userId)
          .single();

        if (error) throw error;

        // Aplicar os valores do banco ao formulário
        form.reset({
          theme: data.theme as "light" | "dark" | "system" || "system",
          language: data.language as "pt-BR" | "en-US" || "pt-BR",
        });

        // Definir o tema atual baseado nas configurações
        setTheme(data.theme || "system");
      } catch (error) {
        console.error("Erro ao buscar configurações:", error);
        toast.error("Não foi possível carregar as configurações");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [userId, form, setTheme]);

  async function onSubmit(data: AppearanceFormValues) {
    setIsLoading(true);
    try {
      const supabase = createClient();
      
      // Atualizar as configurações no banco de dados
      const { error } = await supabase
        .from("user_settings")
        .update({
          theme: data.theme,
          language: data.language,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

      if (error) throw error;
      
      // Aplicar tema
      setTheme(data.theme);
      
      toast.success("Configurações de aparência atualizadas");
    } catch (error) {
      console.error("Erro ao atualizar configurações:", error);
      toast.error("Ocorreu um erro ao salvar as configurações");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Aparência</CardTitle>
        <CardDescription>
          Personalize a aparência da interface e preferências de idioma
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="theme"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tema</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-3 gap-4"
                    >
                      <div>
                        <RadioGroupItem
                          value="light"
                          id="light"
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor="light"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                          <Sun className="h-6 w-6 mb-2" />
                          Claro
                        </Label>
                      </div>
                      <div>
                        <RadioGroupItem
                          value="dark"
                          id="dark"
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor="dark"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                          <Moon className="h-6 w-6 mb-2" />
                          Escuro
                        </Label>
                      </div>
                      <div>
                        <RadioGroupItem
                          value="system"
                          id="system"
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor="system"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                          <div className="flex h-6 w-6 items-center justify-center mb-2">
                            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                          </div>
                          Sistema
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormDescription>
                    Selecione o tema de sua preferência para a interface
                  </FormDescription>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Idioma</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-2 gap-4"
                    >
                      <div>
                        <RadioGroupItem
                          value="pt-BR"
                          id="pt-BR"
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor="pt-BR"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                          🇧🇷 Português (Brasil)
                        </Label>
                      </div>
                      <div>
                        <RadioGroupItem
                          value="en-US"
                          id="en-US"
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor="en-US"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                          🇺🇸 English (US)
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormDescription>
                    Escolha o idioma da interface (algumas partes podem não ser traduzidas)
                  </FormDescription>
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar preferências
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 