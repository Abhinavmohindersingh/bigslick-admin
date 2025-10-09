import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Profile interface for public.profiles table
export interface Profile {
  id: string;
  username: string;
  email?: string;
  created_at?: string;
  updated_at?: string;
  // Optional fields that might not exist in profiles table
  last_sign_in_at?: string;
  email_confirmed_at?: string;
  provider?: string;
}

// Purchase History interface
export interface PurchaseHistory {
  id: string;
  user_id?: string;
  shop_item_id?: string;
  chips_awarded: number;
  price_paid?: number;
  purchase_source?: string;
  package_name?: string;
  is_bonus?: boolean;
  bonus_amount?: number;
  transaction_type?: string;
  created_at: string;
  profiles?: Profile;
}

// Game Result interface
export interface GameResult {
  id: string;
  user_id?: string;
  game_type: string;
  chips_won: number;
  chips_bet: number;
  game_duration_minutes?: number;
  result_type: string;
  session_id?: string;
  created_at: string;
  profiles?: Profile;
}

// User Violation interface
export interface UserViolation {
  id: string;
  user_id?: string;
  violation_type: string;
  violation_description: string;
  evidence_url?: string;
  reported_by?: string;
  moderator_id?: string;
  severity: string;
  status: string;
  created_at: string;
  resolved_at?: string;
  moderator_notes?: string;
  profiles?: Profile;
}

// Leaderboard interface
export interface Leaderboard {
  id: string;
  leaderboard_type: string;
  game_type?: string;
  user_id?: string;
  username: string;
  value: number;
  rank: number;
  updated_at: string;
}