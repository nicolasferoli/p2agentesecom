"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
import { loginSchema } from "@/app/types/actions";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

type LoginFormValues = z.infer<typeof loginSchema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isResendingEmail, setIsResendingEmail] = useState(false);
  const [emailForResend, setEmailForResend] = useState<string | null>(null);
  
  // Verificar se existe erro na URL
  useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
      setErrorMessage(decodeURIComponent(error));
    }
  }, [searchParams]);
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function handleResendConfirmation() {
    if (!emailForResend) return;
    
    setIsResendingEmail(true);
    
    try {
      const supabase = createClient();
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: emailForResend,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) {
        console.error("Erro ao reenviar email:", error);
        toast.error("Não foi possível reenviar o email de confirmação.");
      } else {
        toast.success("Email de confirmação reenviado com sucesso. Verifique sua caixa de entrada.");
      }
    } catch (error) {
      console.error("Erro ao reenviar confirmação:", error);
      toast.error("Falha ao reenviar email de confirmação.");
    } finally {
      setIsResendingEmail(false);
    }
  }

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true);
    setErrorMessage(null);
    setEmailForResend(null);
    
    try {
      console.log("Iniciando processo de login...");
      const supabase = createClient();
      
      // Tenta fazer login
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        // Verificar se é o erro específico de email não confirmado
        if (error.message?.includes("Email not confirmed")) {
          console.error("Email não confirmado:", error);
          
          // Salvar o email para potencial reenvio
          setEmailForResend(data.email);
          
          // Exibir uma mensagem mais amigável para o usuário
          const confirmMessage = "Seu email ainda não foi confirmado. Verifique sua caixa de entrada ou clique no botão abaixo para reenviar o email de confirmação.";
          setErrorMessage(confirmMessage);
          return;
        }
        
        console.error("Erro na autenticação:", error);
        throw error;
      }

      // Verificar se o usuário está realmente logado
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error("Erro ao obter usuário após login:", userError);
        throw new Error("Não foi possível verificar sua identidade após o login.");
      }
      
      console.log("Login bem-sucedido para:", user.email);
      toast.success("Login realizado com sucesso!");
      
      // Aguarda um momento antes de redirecionar para garantir que os cookies sejam definidos
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 500);
    } catch (error: any) {
      console.error("Erro detalhado no login:", error);
      const message = error.message || "Falha ao fazer login. Verifique suas credenciais.";
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
          <CardTitle className="text-2xl font-bold">Login</CardTitle>
          <CardDescription>
            Entre com suas credenciais para acessar sua conta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              {errorMessage && (
                <div className="text-sm font-medium text-destructive">
                  {errorMessage}
                  
                  {emailForResend && (
                    <div className="mt-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="w-full mt-2" 
                        onClick={handleResendConfirmation}
                        disabled={isResendingEmail}
                      >
                        {isResendingEmail ? "Reenviando..." : "Reenviar Email de Confirmação"}
                      </Button>
                    </div>
                  )}
                </div>
              )}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            <Link href="/forgot-password" className="text-primary hover:underline">
              Esqueceu sua senha?
            </Link>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Não tem uma conta?{" "}
            <Link href="/register" className="text-primary hover:underline">
              Registre-se
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function LoginPage() {
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
      <LoginForm />
    </Suspense>
  );
} 