export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '13.0.5'
  }
  public: {
    Tables: {
      api_logs: {
        Row: {
          body: Json | null
          created_at: string | null
          duration_ms: number | null
          endpoint: string
          error_message: string | null
          id: string
          method: string
          response: Json | null
          status_code: number | null
          success: boolean | null
        }
        Insert: {
          body?: Json | null
          created_at?: string | null
          duration_ms?: number | null
          endpoint: string
          error_message?: string | null
          id?: string
          method: string
          response?: Json | null
          status_code?: number | null
          success?: boolean | null
        }
        Update: {
          body?: Json | null
          created_at?: string | null
          duration_ms?: number | null
          endpoint?: string
          error_message?: string | null
          id?: string
          method?: string
          response?: Json | null
          status_code?: number | null
          success?: boolean | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          name: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id: string
          name?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      whatsapp_accounts: {
        Row: {
          business_id: string
          created_at: string
          display_name: string | null
          id: string
          owner_id: string
          status: string
          updated_at: string
          waba_id: string
        }
        Insert: {
          business_id: string
          created_at?: string
          display_name?: string | null
          id?: string
          owner_id?: string
          status?: string
          updated_at?: string
          waba_id: string
        }
        Update: {
          business_id?: string
          created_at?: string
          display_name?: string | null
          id?: string
          owner_id?: string
          status?: string
          updated_at?: string
          waba_id?: string
        }
        Relationships: []
      }
      whatsapp_phone_numbers: {
        Row: {
          created_at: string
          display_phone_number: string | null
          id: string
          phone_number_id: string
          platform_type: string | null
          quality_rating: string | null
          status: string
          updated_at: string
          verified_name: string | null
          whatsapp_account_id: string
        }
        Insert: {
          created_at?: string
          display_phone_number?: string | null
          id?: string
          phone_number_id: string
          platform_type?: string | null
          quality_rating?: string | null
          status?: string
          updated_at?: string
          verified_name?: string | null
          whatsapp_account_id: string
        }
        Update: {
          created_at?: string
          display_phone_number?: string | null
          id?: string
          phone_number_id?: string
          platform_type?: string | null
          quality_rating?: string | null
          status?: string
          updated_at?: string
          verified_name?: string | null
          whatsapp_account_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'whatsapp_phone_numbers_whatsapp_account_id_fkey'
            columns: ['whatsapp_account_id']
            isOneToOne: false
            referencedRelation: 'whatsapp_accounts'
            referencedColumns: ['id']
          },
        ]
      }
      wpp_conversations: {
        Row: {
          contact_name: string | null
          contact_phone: string
          created_at: string
          display_phone_number: string | null
          id: string
          last_message_at: string | null
          owner_id: string | null
          phone_number_id: string
          updated_at: string
          waba_id: string
        }
        Insert: {
          contact_name?: string | null
          contact_phone: string
          created_at?: string
          display_phone_number?: string | null
          id?: string
          last_message_at?: string | null
          owner_id?: string | null
          phone_number_id: string
          updated_at?: string
          waba_id: string
        }
        Update: {
          contact_name?: string | null
          contact_phone?: string
          created_at?: string
          display_phone_number?: string | null
          id?: string
          last_message_at?: string | null
          owner_id?: string | null
          phone_number_id?: string
          updated_at?: string
          waba_id?: string
        }
        Relationships: []
      }
      wpp_messages: {
        Row: {
          conversation_id: string
          created_at: string
          id: string
          message_content: Json | null
          message_id: string
          message_type: string
          raw_payload: Json | null
          timestamp: string
        }
        Insert: {
          conversation_id: string
          created_at?: string
          id?: string
          message_content?: Json | null
          message_id: string
          message_type: string
          raw_payload?: Json | null
          timestamp: string
        }
        Update: {
          conversation_id?: string
          created_at?: string
          id?: string
          message_content?: Json | null
          message_id?: string
          message_type?: string
          raw_payload?: Json | null
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: 'wpp_messages_conversation_id_fkey'
            columns: ['conversation_id']
            isOneToOne: false
            referencedRelation: 'wpp_conversations'
            referencedColumns: ['id']
          },
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

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
