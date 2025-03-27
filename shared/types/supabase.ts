import { Database } from './database.types';

export type Tables = Database['public']['Tables'];

export type Role = 'admin' | 'user';

// Auth related types
export type UserData = {
  id: string;
  email: string;
  role: Role;
  name?: string;
  avatar_url?: string;
};

// Specific entity types
export type Agent = Tables['agents']['Row'];
export type KnowledgeBase = Tables['knowledge_base']['Row'];
export type Document = Tables['documents']['Row'];
export type Chat = Tables['chats']['Row'];
export type Message = Tables['messages']['Row'];
export type Prompt = Tables['prompts']['Row'];
export type Workflow = Tables['workflows']['Row'];
export type ApiKey = Tables['api_keys']['Row'];
export type UserSettings = Tables['user_settings']['Row'];

// Analytics and usage tracking types
export type AgentUsage = Tables['agent_usage']['Row'];
export type DocumentUsage = Tables['document_usage']['Row'];
export type PerformanceMetric = Tables['performance_metrics']['Row'];
export type ActivityLog = Tables['activity_logs']['Row'];

// Basic types for insert operations
export type AgentInsert = Tables['agents']['Insert'];
export type KnowledgeBaseInsert = Tables['knowledge_base']['Insert'];
export type DocumentInsert = Tables['documents']['Insert'];
export type ChatInsert = Tables['chats']['Insert'];
export type MessageInsert = Tables['messages']['Insert'];
export type PromptInsert = Tables['prompts']['Insert'];
export type WorkflowInsert = Tables['workflows']['Insert'];
export type ApiKeyInsert = Tables['api_keys']['Insert'];
export type UserSettingsInsert = Tables['user_settings']['Insert'];

// Analytics insert types
export type AgentUsageInsert = Tables['agent_usage']['Insert'];
export type DocumentUsageInsert = Tables['document_usage']['Insert'];
export type PerformanceMetricInsert = Tables['performance_metrics']['Insert'];
export type ActivityLogInsert = Tables['activity_logs']['Insert'];

// Constantes para tipos de agentes
export enum AGENT_TYPE {
  SIMPLE = "simple",
  MULTI = "multi",
  SEQUENTIAL = "sequential",
  CONDITIONAL = "conditional"
}

// Tipos de parsers de saída
export const OUTPUT_PARSERS = {
  TEXT: "text",
  JSON: "json", 
  CSV: "csv",
  CUSTOM: "custom"
} as const;

export type OutputParser = typeof OUTPUT_PARSERS[keyof typeof OUTPUT_PARSERS];

// Notificações
export enum NOTIFICATION_TYPE {
  AGENT_CREATED = "agent_created",
  AGENT_DELETED = "agent_deleted",
  AGENT_UPDATED = "agent_updated",
  CONVERSATION_STARTED = "conversation_started",
  SYSTEM = "system"
}

export enum CONVERSATION_STATUS {
  ACTIVE = "active",
  ARCHIVED = "archived"
}

// Tipos para agent_usage
export interface AgentUsage {
  id: string;
  agent_id: string;
  user_id: string;
  query: string;
  tokens_used: number;
  response_time: number;
  created_at: string;
  success: boolean;
}

export type AgentUsageInsert = Omit<AgentUsage, 'id' | 'created_at'>;

// Tipos para document_usage
export interface DocumentUsage {
  id: string;
  document_id: string;
  user_id: string;
  agent_id: string | null;
  retrieval_count: number;
  created_at: string;
}

export type DocumentUsageInsert = Omit<DocumentUsage, 'id' | 'created_at'>;

// Tipos para performance_metrics
export interface PerformanceMetric {
  id: string;
  user_id: string;
  agent_id: string | null;
  metric_type: string;
  metric_value: number;
  created_at: string;
}

export type PerformanceMetricInsert = Omit<PerformanceMetric, 'id' | 'created_at'>;

// Tipos para activity_logs
export interface ActivityLog {
  id: string;
  user_id: string;
  activity_type: string;
  details: any;
  created_at: string;
  ip_address: string | null;
}

export type ActivityLogInsert = Omit<ActivityLog, 'id' | 'created_at'>; 