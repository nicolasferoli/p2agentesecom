-- Tabela para rastreamento de uso de agentes
CREATE TABLE IF NOT EXISTS public.agent_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  chat_id UUID REFERENCES public.chats(id) ON DELETE SET NULL,
  input_tokens INTEGER NOT NULL DEFAULT 0,
  output_tokens INTEGER NOT NULL DEFAULT 0,
  prompt_tokens INTEGER NOT NULL DEFAULT 0,
  total_tokens INTEGER NOT NULL DEFAULT 0,
  model TEXT NOT NULL,
  duration_ms INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'completed',
  error TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Tabela para rastreamento de uso de documentos
CREATE TABLE IF NOT EXISTS public.document_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  knowledge_base_id UUID NOT NULL REFERENCES public.knowledge_base(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,
  operation_type TEXT NOT NULL, -- upload, process, embed, retrieve, etc.
  document_type TEXT NOT NULL,
  tokens_processed INTEGER NOT NULL DEFAULT 0,
  chunks_created INTEGER NOT NULL DEFAULT 0,
  processing_time_ms INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'completed',
  error TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Tabela para métricas de desempenho
CREATE TABLE IF NOT EXISTS public.performance_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  resource_type TEXT NOT NULL, -- agent, document, chat, workflow, etc.
  resource_id UUID NOT NULL, 
  operation TEXT NOT NULL, -- create, update, process, generate, etc.
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_ms INTEGER NOT NULL,
  cpu_usage FLOAT,
  memory_usage FLOAT,
  success BOOLEAN NOT NULL DEFAULT true,
  error TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Tabela para logs de atividade detalhados
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  session_id TEXT,
  action TEXT NOT NULL, -- login, create_agent, chat, upload_document, etc.
  entity_type TEXT, -- agent, document, chat, user, etc.
  entity_id UUID,
  ip_address TEXT,
  user_agent TEXT,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Funções e triggers para atualização automática do campo updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar o trigger a todas as tabelas novas
CREATE TRIGGER update_agent_usage_updated_at
BEFORE UPDATE ON public.agent_usage
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_document_usage_updated_at
BEFORE UPDATE ON public.document_usage
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_performance_metrics_updated_at
BEFORE UPDATE ON public.performance_metrics
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activity_logs_updated_at
BEFORE UPDATE ON public.activity_logs
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Habilitando RLS (Row Level Security) para as novas tabelas
ALTER TABLE public.agent_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Criando políticas de segurança para as novas tabelas
CREATE POLICY "Usuários vêem apenas seus próprios dados de uso de agentes" 
ON public.agent_usage FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Usuários vêem apenas seus próprios dados de uso de documentos" 
ON public.document_usage FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Usuários vêem apenas suas próprias métricas de desempenho" 
ON public.performance_metrics FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Usuários vêem apenas seus próprios logs de atividade" 
ON public.activity_logs FOR ALL USING (auth.uid() = user_id);

-- Criar índices para melhorar a performance das consultas
CREATE INDEX IF NOT EXISTS idx_agent_usage_user_id ON public.agent_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_usage_agent_id ON public.agent_usage(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_usage_created_at ON public.agent_usage(created_at);

CREATE INDEX IF NOT EXISTS idx_document_usage_user_id ON public.document_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_document_usage_document_id ON public.document_usage(document_id);
CREATE INDEX IF NOT EXISTS idx_document_usage_knowledge_base_id ON public.document_usage(knowledge_base_id);
CREATE INDEX IF NOT EXISTS idx_document_usage_created_at ON public.document_usage(created_at);

CREATE INDEX IF NOT EXISTS idx_performance_metrics_user_id ON public.performance_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_resource_id ON public.performance_metrics(resource_id);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_created_at ON public.performance_metrics(created_at);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON public.activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs(created_at); 