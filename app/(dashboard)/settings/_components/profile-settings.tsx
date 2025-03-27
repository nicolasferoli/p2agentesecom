"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2, User } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { UserData } from "@/shared/types/supabase";

const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: "O nome deve ter pelo menos 2 caracteres",
  }),
  email: z.string().email({
    message: "Por favor, insira um email válido",
  }).optional(),
  avatar_url: z.string().optional().nullable(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface ProfileSettingsProps {
  userId: string;
}

export function ProfileSettings({ userId }: ProfileSettingsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<UserData | null>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      email: "",
      avatar_url: "",
    },
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      setIsLoading(true);
      try {
        const supabase = createClient();
        const { data: userData, error: userError } = await supabase.auth.getUser();

        if (userError || !userData.user) throw new Error("Erro ao buscar dados do usuário");

        const user = userData.user;
        
        // Construir objeto UserData com os dados do usuário autenticado
        const userProfile: UserData = {
          id: user.id,
          email: user.email || "",
          role: "user",
          name: user.user_metadata?.name || "",
          avatar_url: user.user_metadata?.avatar_url || null,
        };

        setUserProfile(userProfile);
        form.reset({
          name: userProfile.name || "",
          email: userProfile.email || "",
          avatar_url: userProfile.avatar_url || "",
        });
      } catch (error) {
        console.error("Erro ao buscar perfil do usuário:", error);
        toast.error("Não foi possível carregar os dados do perfil");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId, form]);

  async function onSubmit(data: ProfileFormValues) {
    setIsLoading(true);
    try {
      const supabase = createClient();
      
      // Atualizar metadados do usuário no Auth
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          name: data.name,
          avatar_url: data.avatar_url,
        }
      });

      if (updateError) throw updateError;
      
      toast.success("Perfil atualizado com sucesso");
      router.refresh();
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      toast.error("Ocorreu um erro ao atualizar o perfil");
    } finally {
      setIsLoading(false);
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  if (isLoading && !userProfile) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Perfil</CardTitle>
        <CardDescription>
          Gerencie as informações do seu perfil
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-6">
          <Avatar className="h-20 w-20">
            <AvatarImage src={form.getValues("avatar_url") || ""} alt={form.getValues("name")} />
            <AvatarFallback className="text-lg">
              {form.getValues("name") ? getInitials(form.getValues("name")) : <User />}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-lg font-medium">{form.getValues("name") || "Sem nome"}</h3>
            <p className="text-sm text-muted-foreground">{form.getValues("email") || "Sem email"}</p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Seu nome" {...field} />
                  </FormControl>
                  <FormDescription>
                    Este é o nome que será exibido no seu perfil
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Seu email" 
                      {...field} 
                      disabled 
                      className="bg-muted"
                    />
                  </FormControl>
                  <FormDescription>
                    Seu email de login não pode ser alterado
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="avatar_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL do Avatar</FormLabel>
                  <FormControl>
                    <Input placeholder="https://exemplo.com/seu-avatar.jpg" {...field} 
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription>
                    URL da imagem que será usada como seu avatar
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar alterações
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 