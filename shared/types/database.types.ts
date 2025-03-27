export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      agents: {
        Row: {
          id: string
          name: string
          description: string
          model: string
          temperature: number
          user_id: string
          enabled: boolean
          avatar: string | null
          knowledge_base_id: string | null
          system_prompt: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          model: string
          temperature: number
          user_id: string
          enabled?: boolean
          avatar?: string | null
          knowledge_base_id?: string | null
          system_prompt: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          model?: string
          temperature?: number
          user_id?: string
          enabled?: boolean
          avatar?: string | null
          knowledge_base_id?: string | null
          system_prompt?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agents_knowledge_base_id_fkey"
            columns: ["knowledge_base_id"]
            referencedRelation: "knowledge_base"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agents_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      api_keys: {
        Row: {
          id: string
          name: string
          key: string
          user_id: string
          enabled: boolean
          last_used: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          key: string
          user_id: string
          enabled?: boolean
          last_used?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          key?: string
          user_id?: string
          enabled?: boolean
          last_used?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      chats: {
        Row: {
          id: string
          title: string
          user_id: string
          agent_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          user_id: string
          agent_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          user_id?: string
          agent_id?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chats_agent_id_fkey"
            columns: ["agent_id"]
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chats_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      documents: {
        Row: {
          id: string
          name: string
          type: string
          knowledge_base_id: string
          user_id: string
          status: string
          content: string | null
          metadata: Json | null
          file_path: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          type: string
          knowledge_base_id: string
          user_id: string
          status?: string
          content?: string | null
          metadata?: Json | null
          file_path?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: string
          knowledge_base_id?: string
          user_id?: string
          status?: string
          content?: string | null
          metadata?: Json | null
          file_path?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_knowledge_base_id_fkey"
            columns: ["knowledge_base_id"]
            referencedRelation: "knowledge_base"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      knowledge_base: {
        Row: {
          id: string
          name: string
          description: string
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          user_id?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_base_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      messages: {
        Row: {
          id: string
          chat_id: string
          content: string
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          chat_id: string
          content: string
          role: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          chat_id?: string
          content?: string
          role?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_chat_id_fkey"
            columns: ["chat_id"]
            referencedRelation: "chats"
            referencedColumns: ["id"]
          }
        ]
      }
      prompts: {
        Row: {
          id: string
          name: string
          description: string
          user_id: string
          content: string
          version: number
          tags: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          user_id: string
          content: string
          version?: number
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          user_id?: string
          content?: string
          version?: number
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "prompts_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          role: string
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          role?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          role?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_settings: {
        Row: {
          id: string
          user_id: string
          theme: string
          notifications: boolean
          language: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          theme?: string
          notifications?: boolean
          language?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          theme?: string
          notifications?: boolean
          language?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_settings_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      workflows: {
        Row: {
          id: string
          name: string
          description: string
          user_id: string
          config: Json
          enabled: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          user_id: string
          config: Json
          enabled?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          user_id?: string
          config?: Json
          enabled?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflows_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      agent_usage: {
        Row: {
          id: string
          user_id: string
          agent_id: string
          chat_id: string | null
          input_tokens: number
          output_tokens: number
          prompt_tokens: number
          total_tokens: number
          model: string
          duration_ms: number
          status: string
          error: string | null
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          agent_id: string
          chat_id?: string | null
          input_tokens: number
          output_tokens: number
          prompt_tokens: number
          total_tokens?: number
          model: string
          duration_ms: number
          status?: string
          error?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          agent_id?: string
          chat_id?: string | null
          input_tokens?: number
          output_tokens?: number
          prompt_tokens?: number
          total_tokens?: number
          model?: string
          duration_ms?: number
          status?: string
          error?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_usage_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_usage_agent_id_fkey"
            columns: ["agent_id"]
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_usage_chat_id_fkey"
            columns: ["chat_id"]
            referencedRelation: "chats"
            referencedColumns: ["id"]
          }
        ]
      }
      document_usage: {
        Row: {
          id: string
          user_id: string
          document_id: string
          knowledge_base_id: string
          agent_id: string | null
          operation_type: string
          document_type: string
          tokens_processed: number
          chunks_created: number
          processing_time_ms: number
          status: string
          error: string | null
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          document_id: string
          knowledge_base_id: string
          agent_id?: string | null
          operation_type: string
          document_type: string
          tokens_processed: number
          chunks_created: number
          processing_time_ms: number
          status?: string
          error?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          document_id?: string
          knowledge_base_id?: string
          agent_id?: string | null
          operation_type?: string
          document_type?: string
          tokens_processed?: number
          chunks_created?: number
          processing_time_ms?: number
          status?: string
          error?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_usage_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_usage_document_id_fkey"
            columns: ["document_id"]
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_usage_knowledge_base_id_fkey"
            columns: ["knowledge_base_id"]
            referencedRelation: "knowledge_base"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_usage_agent_id_fkey"
            columns: ["agent_id"]
            referencedRelation: "agents"
            referencedColumns: ["id"]
          }
        ]
      }
      performance_metrics: {
        Row: {
          id: string
          user_id: string
          resource_type: string
          resource_id: string
          operation: string
          start_time: string
          end_time: string
          duration_ms: number
          cpu_usage: number | null
          memory_usage: number | null
          success: boolean
          error: string | null
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          resource_type: string
          resource_id: string
          operation: string
          start_time: string
          end_time: string
          duration_ms: number
          cpu_usage?: number | null
          memory_usage?: number | null
          success?: boolean
          error?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          resource_type?: string
          resource_id?: string
          operation?: string
          start_time?: string
          end_time?: string
          duration_ms?: number
          cpu_usage?: number | null
          memory_usage?: number | null
          success?: boolean
          error?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "performance_metrics_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      activity_logs: {
        Row: {
          id: string
          user_id: string
          session_id: string | null
          action: string
          entity_type: string | null
          entity_id: string | null
          ip_address: string | null
          user_agent: string | null
          details: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          session_id?: string | null
          action: string
          entity_type?: string | null
          entity_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          details?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          session_id?: string | null
          action?: string
          entity_type?: string | null
          entity_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          details?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
} 