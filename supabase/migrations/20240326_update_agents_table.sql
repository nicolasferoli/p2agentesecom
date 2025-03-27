-- Adicionar novas colunas à tabela agents
ALTER TABLE agents
ADD COLUMN IF NOT EXISTS output_parser TEXT NOT NULL DEFAULT 'text',
ADD COLUMN IF NOT EXISTS agent_type TEXT NOT NULL DEFAULT 'standard',
ADD COLUMN IF NOT EXISTS parent_agent_id UUID REFERENCES agents(id),
ADD COLUMN IF NOT EXISTS execution_order INT,
ADD COLUMN IF NOT EXISTS condition TEXT;

-- Criar índice para melhorar a performance de consultas relacionadas a agentes filhos
CREATE INDEX IF NOT EXISTS idx_agents_parent_agent_id ON agents(parent_agent_id);

-- Criar índice para ordenação de agentes sequenciais
CREATE INDEX IF NOT EXISTS idx_agents_execution_order ON agents(execution_order);

-- Comentários nas colunas
COMMENT ON COLUMN agents.output_parser IS 'Tipo de formatação da saída do agente: text, json, csv, custom';
COMMENT ON COLUMN agents.agent_type IS 'Tipo de agente: standard, multi, sequential, conditional';
COMMENT ON COLUMN agents.parent_agent_id IS 'ID do agente pai em caso de agentes compostos';
COMMENT ON COLUMN agents.execution_order IS 'Ordem de execução para agentes sequenciais';
COMMENT ON COLUMN agents.condition IS 'Condição para agentes condicionais'; 