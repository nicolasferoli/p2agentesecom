-- Tabela para rastrear o uso de agentes
CREATE TABLE IF NOT EXISTS public.agent_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL,
  user_id UUID NOT NULL,
  query TEXT NOT NULL,
  tokens_used INTEGER NOT NULL DEFAULT 0,
  response_time INTEGER NOT NULL DEFAULT 0, -- em milissegundos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  success BOOLEAN DEFAULT TRUE
);

-- Políticas RLS para agent_usage
ALTER TABLE public.agent_usage ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários leiam apenas seus próprios dados
CREATE POLICY "Usuários podem ler seus próprios dados de uso de agentes" ON public.agent_usage
  FOR SELECT USING (auth.uid() = user_id);

-- Política para permitir que usuários insiram dados relacionados a eles
CREATE POLICY "Usuários podem inserir seus próprios dados de uso de agentes" ON public.agent_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Tabela para rastrear o uso de documentos
CREATE TABLE IF NOT EXISTS public.document_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL,
  user_id UUID NOT NULL,
  agent_id UUID,
  retrieval_count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Políticas RLS para document_usage
ALTER TABLE public.document_usage ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários leiam apenas seus próprios dados
CREATE POLICY "Usuários podem ler seus próprios dados de uso de documentos" ON public.document_usage
  FOR SELECT USING (auth.uid() = user_id);

-- Política para permitir que usuários insiram dados relacionados a eles
CREATE POLICY "Usuários podem inserir seus próprios dados de uso de documentos" ON public.document_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Tabela para métricas de desempenho
CREATE TABLE IF NOT EXISTS public.performance_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  agent_id UUID,
  metric_type VARCHAR(255) NOT NULL, -- 'latency', 'accuracy', 'satisfaction', etc.
  metric_value FLOAT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Políticas RLS para performance_metrics
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários leiam apenas seus próprios dados
CREATE POLICY "Usuários podem ler suas próprias métricas de desempenho" ON public.performance_metrics
  FOR SELECT USING (auth.uid() = user_id);

-- Política para permitir que usuários insiram dados relacionados a eles
CREATE POLICY "Usuários podem inserir suas próprias métricas de desempenho" ON public.performance_metrics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Tabela para logs de atividade
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  activity_type VARCHAR(255) NOT NULL, -- 'login', 'agent_creation', 'knowledge_base_creation', etc.
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address VARCHAR(45) -- suporta IPv4 e IPv6
);

-- Políticas RLS para activity_logs
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários leiam apenas seus próprios logs
CREATE POLICY "Usuários podem ler seus próprios logs de atividade" ON public.activity_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Política para permitir que usuários insiram dados relacionados a eles
CREATE POLICY "Usuários podem inserir seus próprios logs de atividade" ON public.activity_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id); 