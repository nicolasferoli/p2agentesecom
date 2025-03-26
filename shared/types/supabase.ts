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
export type Workflow = Tables['workflows']['Row'];
export type Prompt = Tables['prompts']['Row'];
export type Chat = Tables['chats']['Row'];
export type Message = Tables['messages']['Row'];
export type ApiKey = Tables['api_keys']['Row'];
export type UserSettings = Tables['user_settings']['Row']; 