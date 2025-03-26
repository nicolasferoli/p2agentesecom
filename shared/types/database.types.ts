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
          created_at: string
          name: string
          description: string
          model: string
          temperature: number
          user_id: string
          enabled: boolean
          avatar: string | null
          knowledge_base_id: string | null
          system_prompt: string
          updated_at: string
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          description: string
          model: string
          temperature: number
          user_id: string
          enabled?: boolean
          avatar?: string | null
          knowledge_base_id?: string | null
          system_prompt: string
          updated_at?: string
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          description?: string
          model?: string
          temperature?: number
          user_id?: string
          enabled?: boolean
          avatar?: string | null
          knowledge_base_id?: string | null
          system_prompt?: string
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
      knowledge_base: {
        Row: {
          id: string
          created_at: string
          name: string
          description: string
          user_id: string
          updated_at: string
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          description: string
          user_id: string
          updated_at?: string
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          description?: string
          user_id?: string
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
      documents: {
        Row: {
          id: string
          created_at: string
          name: string
          type: string
          knowledge_base_id: string
          user_id: string
          status: string
          content: string | null
          metadata: Json | null
          file_path: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          type: string
          knowledge_base_id: string
          user_id: string
          status?: string
          content?: string | null
          metadata?: Json | null
          file_path?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          type?: string
          knowledge_base_id?: string
          user_id?: string
          status?: string
          content?: string | null
          metadata?: Json | null
          file_path?: string | null
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
      workflows: {
        Row: {
          id: string
          created_at: string
          name: string
          description: string
          user_id: string
          config: Json
          enabled: boolean
          updated_at: string
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          description: string
          user_id: string
          config: Json
          enabled?: boolean
          updated_at?: string
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          description?: string
          user_id?: string
          config?: Json
          enabled?: boolean
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
      prompts: {
        Row: {
          id: string
          created_at: string
          name: string
          description: string
          user_id: string
          content: string
          version: number
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          description: string
          user_id: string
          content: string
          version?: number
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          description?: string
          user_id?: string
          content?: string
          version?: number
          tags?: string[] | null
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
      chats: {
        Row: {
          id: string
          created_at: string
          title: string
          user_id: string
          agent_id: string
          updated_at: string
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          user_id: string
          agent_id: string
          updated_at?: string
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          user_id?: string
          agent_id?: string
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
      messages: {
        Row: {
          id: string
          created_at: string
          chat_id: string
          content: string
          role: string
          updated_at: string
        }
        Insert: {
          id?: string
          created_at?: string
          chat_id: string
          content: string
          role: string
          updated_at?: string
        }
        Update: {
          id?: string
          created_at?: string
          chat_id?: string
          content?: string
          role?: string
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
      api_keys: {
        Row: {
          id: string
          created_at: string
          name: string
          key: string
          user_id: string
          enabled: boolean
          last_used: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          key: string
          user_id: string
          enabled?: boolean
          last_used?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          key?: string
          user_id?: string
          enabled?: boolean
          last_used?: string | null
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
      user_settings: {
        Row: {
          id: string
          created_at: string
          user_id: string
          theme: string
          notifications: boolean
          language: string
          updated_at: string
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          theme?: string
          notifications?: boolean
          language?: string
          updated_at?: string
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          theme?: string
          notifications?: boolean
          language?: string
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