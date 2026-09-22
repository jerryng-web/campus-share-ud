export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type ProfileRow = {
  created_at: string;
  first_name: string;
  id: string;
  last_name: string;
  phone: string | null;
  phone_normalized: string | null;
};

type ItemRow = {
  building: string;
  category: string;
  complex: string;
  created_at: string;
  description: string;
  id: string;
  owner_id: string;
  pickup_instructions: string | null;
  purchase_price: number;
  status: string;
  title: string;
};

type TransactionRow = {
  approved_at: string | null;
  billed_amount: number | null;
  borrower_accepted_at: string | null;
  borrower_id: string;
  borrower_phone: string | null;
  borrower_student_id: string | null;
  completed_at: string | null;
  created_at: string;
  due_at: string | null;
  end_date: string;
  extension_borrower_accepted_at: string | null;
  extension_lender_accepted_at: string | null;
  extension_proposed_by: string | null;
  extension_return_at: string | null;
  handed_back_at: string | null;
  id: string;
  incident_type: string | null;
  inspected_at: string | null;
  item_id: string;
  last_activity_at: string;
  lender_accepted_at: string | null;
  lender_id: string;
  lent_at: string | null;
  proposed_by: string | null;
  proposed_pickup_at: string | null;
  proposed_return_at: string | null;
  request_message: string | null;
  requested_at: string;
  start_date: string;
  status: string;
};

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      account_phones: {
        Row: {
          created_at: string;
          phone: string;
          phone_normalized: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          phone: string;
          phone_normalized: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          phone?: string;
          phone_normalized?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      blocked_phones: {
        Row: {
          created_at: string;
          flag_level: string;
          flagged_user_id: string | null;
          phone_normalized: string;
        };
        Insert: {
          created_at?: string;
          flag_level: string;
          flagged_user_id?: string | null;
          phone_normalized: string;
        };
        Update: {
          created_at?: string;
          flag_level?: string;
          flagged_user_id?: string | null;
          phone_normalized?: string;
        };
        Relationships: [];
      };
      borrower_flags: {
        Row: {
          created_at: string;
          id: string;
          level: string;
          set_by: string;
          subject_id: string;
          transaction_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          level: string;
          set_by: string;
          subject_id: string;
          transaction_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          level?: string;
          set_by?: string;
          subject_id?: string;
          transaction_id?: string;
        };
        Relationships: [];
      };
      items: {
        Row: ItemRow;
        Insert: Omit<ItemRow, "id" | "created_at" | "status" | "purchase_price"> & {
          id?: string;
          created_at?: string;
          status?: string;
          purchase_price?: number;
          pickup_instructions?: string | null;
        };
        Update: Partial<ItemRow>;
        Relationships: [];
      };
      profiles: {
        Row: ProfileRow;
        Insert: Omit<ProfileRow, "created_at" | "phone" | "phone_normalized"> & {
          created_at?: string;
          phone?: string | null;
          phone_normalized?: string | null;
        };
        Update: Partial<ProfileRow>;
        Relationships: [];
      };
      reviews: {
        Row: {
          communication: number;
          created_at: string;
          followed_instructions: number;
          id: string;
          item_condition: number;
          rater_id: string;
          subject_id: string;
          subject_role: string;
          transaction_id: string;
        };
        Insert: {
          communication: number;
          created_at?: string;
          followed_instructions: number;
          id?: string;
          item_condition: number;
          rater_id: string;
          subject_id: string;
          subject_role: string;
          transaction_id: string;
        };
        Update: {
          communication?: number;
          created_at?: string;
          followed_instructions?: number;
          id?: string;
          item_condition?: number;
          rater_id?: string;
          subject_id?: string;
          subject_role?: string;
          transaction_id?: string;
        };
        Relationships: [];
      };
      transaction_messages: {
        Row: {
          body: string;
          created_at: string;
          id: string;
          sender_id: string;
          transaction_id: string;
        };
        Insert: {
          body: string;
          created_at?: string;
          id?: string;
          sender_id: string;
          transaction_id: string;
        };
        Update: {
          body?: string;
          created_at?: string;
          id?: string;
          sender_id?: string;
          transaction_id?: string;
        };
        Relationships: [];
      };
      transactions: {
        Row: TransactionRow;
        Insert: Partial<TransactionRow> & {
          item_id: string;
          lender_id: string;
          borrower_id: string;
          start_date: string;
          end_date: string;
        };
        Update: Partial<TransactionRow>;
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      current_borrower_flag: { Args: { p_user: string }; Returns: string };
      expire_stale_requests: { Args: Record<string, never>; Returns: undefined };
      is_phone_blocked: { Args: { raw: string }; Returns: boolean };
      is_phone_in_use: { Args: { raw: string }; Returns: boolean };
      maybe_restore_item: { Args: { p_except: string; p_item: string }; Returns: undefined };
      normalize_phone: { Args: { raw: string }; Returns: string };
      rating_summary: {
        Args: { p_role: string; p_user: string };
        Returns: {
          avg_communication: number;
          avg_condition: number;
          avg_instructions: number;
          avg_overall: number;
          review_count: number;
        }[];
      };
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
