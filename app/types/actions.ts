import { z } from 'zod';

// Common response type for all server actions
export type ActionResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
};

// Commonly used form input schemas
export const emailSchema = z.object({
  email: z.string().email({ message: 'E-mail inválido' }),
});

export const passwordSchema = z.object({
  password: z.string().min(8, { message: 'A senha deve ter pelo menos 8 caracteres' }),
});

export const loginSchema = emailSchema.merge(passwordSchema);

export const registerSchema = loginSchema.extend({
  name: z.string().min(2, { message: 'O nome deve ter pelo menos 2 caracteres' }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

// Agentes
export const agentSchema = z.object({
  name: z.string().min(3, { message: 'O nome deve ter pelo menos 3 caracteres' }),
  description: z.string().min(10, { message: 'A descrição deve ter pelo menos 10 caracteres' }),
  model: z.string().min(1, { message: 'O modelo é obrigatório' }),
  temperature: z.number().min(0).max(1),
  system_prompt: z.string().min(10, { message: 'O prompt do sistema deve ter pelo menos 10 caracteres' }),
  knowledge_base_id: z.string().optional().nullable(),
  enabled: z.boolean().default(true),
  avatar: z.string().optional().nullable(),
});

// Base de conhecimento
export const knowledgeBaseSchema = z.object({
  name: z.string().min(3, { message: 'O nome deve ter pelo menos 3 caracteres' }),
  description: z.string().min(10, { message: 'A descrição deve ter pelo menos 10 caracteres' }),
});

// Documento
export const documentSchema = z.object({
  name: z.string().min(3, { message: 'O nome deve ter pelo menos 3 caracteres' }),
  type: z.string(),
  knowledge_base_id: z.string(),
});

// Prompt
export const promptSchema = z.object({
  name: z.string().min(3, { message: 'O nome deve ter pelo menos 3 caracteres' }),
  description: z.string().min(10, { message: 'A descrição deve ter pelo menos 10 caracteres' }),
  content: z.string().min(10, { message: 'O conteúdo deve ter pelo menos 10 caracteres' }),
  tags: z.array(z.string()).optional(),
}); 