"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { registerSchema } from "@/app/types/actions";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

type RegisterFormValues = z.infer<typeof registerSchema>;

function RegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDev, setIsDev] = useState(false);
  
  // Detectar ambiente de desenvolvimento
  useEffect(() => {
    setIsDev(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  }, []);
  
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: RegisterFormValues) {
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      console.log("Iniciando processo de registro...");
      const supabase = createClient();
      
      // Em desenvolvimento, podemos desativar o email de confirmação
      const options = isDev 
        ? {
            data: { name: data.name },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            // Em desenvolvimento, não exigir confirmação de email
            emailConfirmationEnabled: false
          }
        : {
            data: { name: data.name },
            emailRedirectTo: `${window.location.origin}/auth/callback`
          };
      
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options
      });

      if (error) {
        console.error("Erro no registro:", error);
        throw error;
      }

      console.log("Resultado do registro:", authData);
      
      // Verifica se o usuário foi criado ou se o email de confirmação foi enviado
      if (authData?.user) {
        console.log("Usuário criado com ID:", authData.user.id);
        
        if (isDev && !authData.session) {
          // Em ambiente de desenvolvimento, tentamos fazer login automaticamente
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: data.email,
            password: data.password
          });
          
          if (signInError) {
            console.warn("Não foi possível fazer login automático:", signInError);
            toast.success("Conta criada com sucesso! Você precisa fazer login manualmente.");
            setTimeout(() => router.push("/login"), 500);
          } else {
            toast.success("Conta criada e login automático realizado com sucesso!");
            setTimeout(() => router.push("/dashboard"), 500);
          }
        } else {
          toast.success("Conta criada com sucesso! Verifique seu e-mail para confirmar o cadastro.");
          setTimeout(() => router.push("/login"), 500);
        }
      } else {
        toast.info("Verifique seu e-mail para concluir o cadastro.");
        setTimeout(() => router.push("/login"), 500);
      }
    } catch (error: any) {
      console.error("Erro detalhado no registro:", error);
      let message = "Falha ao criar conta. Por favor, tente novamente.";
      
      // Mensagens de erro personalizadas com base no código de erro
      if (error.message?.includes("email already")) {
        message = "Este e-mail já está em uso. Tente fazer login ou recuperar sua senha.";
      }
      
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-background/80 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Criar conta</CardTitle>
          <CardDescription>
            Preencha os dados abaixo para criar sua conta
            {isDev && (
              <span className="block mt-1 text-xs text-amber-500">
                Modo de desenvolvimento: confirmação de email desativada
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Seu nome completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input placeholder="seu@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar Senha</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {errorMessage && (
                <div className="text-sm font-medium text-destructive">
                  {errorMessage}
                </div>
              )}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Criando conta..." : "Criar conta"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Já tem uma conta?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Faça login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md p-8">
          <div className="flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        </Card>
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
} 