-- Adicionar tabelas para Analytics
-- Esta migração adiciona tabelas necessárias para rastreamento detalhado de uso

-- Tabela de eventos de usuário
CREATE TABLE public.user_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Tabela de estatísticas de documento
CREATE TABLE public.document_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  views INTEGER DEFAULT 0 NOT NULL,
  agent_uses INTEGER DEFAULT 0 NOT NULL,
  last_viewed TIMESTAMP WITH TIME ZONE,
  last_used_by_agent TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Tabela de estatísticas de agente
CREATE TABLE public.agent_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  total_chats INTEGER DEFAULT 0 NOT NULL,
  total_messages INTEGER DEFAULT 0 NOT NULL,
  avg_response_time NUMERIC DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Tabela de estatísticas de conhecimento
CREATE TABLE public.knowledge_base_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  knowledge_base_id UUID NOT NULL REFERENCES public.knowledge_base(id) ON DELETE CASCADE,
  total_documents INTEGER DEFAULT 0 NOT NULL,
  total_uses INTEGER DEFAULT 0 NOT NULL,
  document_types JSONB DEFAULT '{}'::jsonb NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Tabela de sessões de uso
CREATE TABLE public.usage_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  session_data JSONB DEFAULT '{}'::jsonb NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Aplicar triggers para atualização automática do campo updated_at
CREATE TRIGGER update_document_stats_updated_at
BEFORE UPDATE ON public.document_stats
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_stats_updated_at
BEFORE UPDATE ON public.agent_stats
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_knowledge_base_stats_updated_at
BEFORE UPDATE ON public.knowledge_base_stats
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usage_sessions_updated_at
BEFORE UPDATE ON public.usage_sessions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS em todas as tabelas de analytics
ALTER TABLE public.user_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_base_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_sessions ENABLE ROW LEVEL SECURITY;

-- Política para usuários verem apenas seus próprios dados de analytics
CREATE POLICY "Usuários vêem apenas seus próprios eventos" ON public.user_events
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Usuários vêem apenas estatísticas de seus documentos" ON public.document_stats
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.documents
    WHERE documents.id = document_stats.document_id AND documents.user_id = auth.uid()
  ));

CREATE POLICY "Usuários vêem apenas estatísticas de seus agentes" ON public.agent_stats
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.agents
    WHERE agents.id = agent_stats.agent_id AND agents.user_id = auth.uid()
  ));

CREATE POLICY "Usuários vêem apenas estatísticas de suas bases de conhecimento" ON public.knowledge_base_stats
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.knowledge_base
    WHERE knowledge_base.id = knowledge_base_stats.knowledge_base_id AND knowledge_base.user_id = auth.uid()
  ));

CREATE POLICY "Usuários vêem apenas suas próprias sessões de uso" ON public.usage_sessions
  FOR ALL USING (auth.uid() = user_id);

-- Funções para atualização automática das estatísticas

-- Função para atualizar estatísticas de documento ao fazer upload
CREATE OR REPLACE FUNCTION public.handle_document_upload()
RETURNS TRIGGER AS $$
BEGIN
  -- Inserir estatísticas iniciais para o documento
  INSERT INTO public.document_stats (document_id)
  VALUES (NEW.id);
  
  -- Atualizar contagem de documentos na base de conhecimento
  INSERT INTO public.knowledge_base_stats (knowledge_base_id, total_documents, document_types)
  VALUES (
    NEW.knowledge_base_id, 
    1, 
    jsonb_build_object(NEW.type, 1)
  )
  ON CONFLICT (knowledge_base_id) 
  DO UPDATE SET 
    total_documents = knowledge_base_stats.total_documents + 1,
    document_types = jsonb_set(
      COALESCE(knowledge_base_stats.document_types, '{}'::jsonb),
      ARRAY[NEW.type],
      COALESCE((knowledge_base_stats.document_types->>NEW.type)::integer, 0)::integer + 1
    );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para atualizar estatísticas de mensagens
CREATE OR REPLACE FUNCTION public.handle_message_created()
RETURNS TRIGGER AS $$
DECLARE
  v_agent_id UUID;
  v_start_time TIMESTAMP WITH TIME ZONE;
  v_response_time NUMERIC;
BEGIN
  -- Obter o agent_id do chat
  SELECT agent_id INTO v_agent_id FROM public.chats WHERE id = NEW.chat_id;
  
  -- Se for uma mensagem do assistente, calcular tempo de resposta
  IF NEW.role = 'assistant' THEN
    -- Buscar a última mensagem do usuário neste chat
    SELECT created_at INTO v_start_time 
    FROM public.messages 
    WHERE chat_id = NEW.chat_id AND role = 'user'
    ORDER BY created_at DESC
    LIMIT 1;
    
    IF v_start_time IS NOT NULL THEN
      -- Calcular tempo de resposta em milissegundos
      v_response_time := EXTRACT(EPOCH FROM (NEW.created_at - v_start_time)) * 1000;
      
      -- Atualizar estatísticas do agente
      INSERT INTO public.agent_stats (agent_id, total_messages, avg_response_time)
      VALUES (v_agent_id, 1, v_response_time)
      ON CONFLICT (agent_id) 
      DO UPDATE SET 
        total_messages = agent_stats.total_messages + 1,
        avg_response_time = (agent_stats.avg_response_time * agent_stats.total_messages + v_response_time) / (agent_stats.total_messages + 1);
    ELSE
      -- Se não houver mensagem anterior do usuário, apenas incrementar contagem
      INSERT INTO public.agent_stats (agent_id, total_messages)
      VALUES (v_agent_id, 1)
      ON CONFLICT (agent_id) 
      DO UPDATE SET 
        total_messages = agent_stats.total_messages + 1;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para atualizar estatísticas de chat
CREATE OR REPLACE FUNCTION public.handle_chat_created()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar estatísticas do agente
  INSERT INTO public.agent_stats (agent_id, total_chats)
  VALUES (NEW.agent_id, 1)
  ON CONFLICT (agent_id) 
  DO UPDATE SET 
    total_chats = agent_stats.total_chats + 1;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para atualizar estatísticas após upload de documento
CREATE TRIGGER on_document_created
AFTER INSERT ON public.documents
FOR EACH ROW EXECUTE FUNCTION public.handle_document_upload();

-- Trigger para atualizar estatísticas após criação de mensagem
CREATE TRIGGER on_message_created
AFTER INSERT ON public.messages
FOR EACH ROW EXECUTE FUNCTION public.handle_message_created();

-- Trigger para atualizar estatísticas após criação de chat
CREATE TRIGGER on_chat_created
AFTER INSERT ON public.chats
FOR EACH ROW EXECUTE FUNCTION public.handle_chat_created(); 