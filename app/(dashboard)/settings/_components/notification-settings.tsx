"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

const notificationsFormSchema = z.object({
  notifications: z.boolean().default(true),
  marketingEmails: z.boolean().default(false),
  securityAlerts: z.boolean().default(true),
  productUpdates: z.boolean().default(true),
});

type NotificationsFormValues = z.infer<typeof notificationsFormSchema>;

interface NotificationSettingsProps {
  userId: string;
}

export function NotificationSettings({ userId }: NotificationSettingsProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<NotificationsFormValues>({
    resolver: zodResolver(notificationsFormSchema),
    defaultValues: {
      notifications: true,
      marketingEmails: false,
      securityAlerts: true,
      productUpdates: true,
    },
  });

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("user_settings")
          .select("notifications")
          .eq("user_id", userId)
          .single();

        if (error) throw error;

        // Aplicar a configuração de notificações principal
        form.reset({
          ...form.getValues(),
          notifications: data.notifications,
        });
      } catch (error) {
        console.error("Erro ao buscar configurações:", error);
        toast.error("Não foi possível carregar as configurações de notificações");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [userId, form]);

  async function onSubmit(data: NotificationsFormValues) {
    setIsLoading(true);
    try {
      const supabase = createClient();
      
      // Atualizar as configurações no banco de dados
      const { error } = await supabase
        .from("user_settings")
        .update({
          notifications: data.notifications,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

      if (error) throw error;
      
      toast.success("Preferências de notificações atualizadas");
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
        <CardTitle>Notificações</CardTitle>
        <CardDescription>
          Configure como e quando você deseja receber notificações
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="notifications"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Ativar notificações</FormLabel>
                    <FormDescription>
                      Receba notificações sobre atividades em sua conta
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <div className="space-y-4">
              <div className="text-sm font-medium">Preferências detalhadas</div>
              
              <FormField
                control={form.control}
                name="marketingEmails"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Emails de marketing</FormLabel>
                      <FormDescription>
                        Receba emails sobre novos recursos e ofertas
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={!form.getValues().notifications}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="securityAlerts"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Alertas de segurança</FormLabel>
                      <FormDescription>
                        Alertas importantes sobre sua conta e segurança
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={!form.getValues().notifications}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="productUpdates"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Atualizações do produto</FormLabel>
                      <FormDescription>
                        Notificações sobre atualizações e novos recursos
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={!form.getValues().notifications}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            
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