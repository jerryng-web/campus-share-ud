export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      items: {
        Row: {
          building: string;
          category: string;
          complex: string;
          created_at: string;
          description: string;
          id: string;
          owner_id: string;
          pickup_instructions: string | null;
          status: string;
          title: string;
        };
        Insert: {
          building: string;
          category: string;
          complex: string;
          created_at?: string;
          description: string;
          id?: string;
          owner_id: string;
          pickup_instructions?: string | null;
          status?: string;
          title: string;
        };
        Update: {
          building?: string;
          category?: string;
          complex?: string;
          created_at?: string;
          description?: string;
          id?: string;
          owner_id?: string;
          pickup_instructions?: string | null;
          status?: string;
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: "items_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          created_at: string;
          first_name: string;
          id: string;
          last_name: string;
        };
        Insert: {
          created_at?: string;
          first_name: string;
          id: string;
          last_name: string;
        };
        Update: {
          created_at?: string;
          first_name?: string;
          id?: string;
          last_name?: string;
        };
        Relationships: [];
      };
      transactions: {
        Row: {
          approved_at: string | null;
          borrower_id: string;
          borrower_student_id: string | null;
          completed_at: string | null;
          created_at: string;
          end_date: string;
          id: string;
          item_id: string;
          lender_id: string;
          requested_at: string;
          start_date: string;
          status: string;
        };
        Insert: {
          approved_at?: string | null;
          borrower_id: string;
          borrower_student_id?: string | null;
          completed_at?: string | null;
          created_at?: string;
          end_date: string;
          id?: string;
          item_id: string;
          lender_id: string;
          requested_at?: string;
          start_date: string;
          status?: string;
        };
        Update: {
          approved_at?: string | null;
          borrower_id?: string;
          borrower_student_id?: string | null;
          completed_at?: string | null;
          created_at?: string;
          end_date?: string;
          id?: string;
          item_id?: string;
          lender_id?: string;
          requested_at?: string;
          start_date?: string;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "transactions_borrower_id_fkey";
            columns: ["borrower_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "transactions_item_id_fkey";
            columns: ["item_id"];
            isOneToOne: false;
            referencedRelation: "items";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "transactions_lender_id_fkey";
            columns: ["lender_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
