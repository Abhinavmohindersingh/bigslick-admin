/*
  # Create 21 Hold'em Game Environment

  1. New Tables
    - `holdem_21_sessions` - Game session management
    - `holdem_21_players` - Player seats and status
    - `holdem_21_hands` - Individual hand tracking
    - `holdem_21_actions` - Player actions log
    - `holdem_21_results` - Hand results and payouts
    - `holdem_21_stats` - Player statistics

  2. Security
    - Enable RLS on all tables
    - Add policies for session participants
    - Add policies for game hosts

  3. Features
    - Multi-table support (different stakes)
    - Real-time game state management
    - Comprehensive action logging
    - Statistics tracking
*/

-- 21 Hold'em Sessions Table
CREATE TABLE IF NOT EXISTS holdem_21_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_code text UNIQUE NOT NULL,
  table_name text NOT NULL DEFAULT '21-holdem-default',
  host_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Game Configuration
  small_blind bigint NOT NULL DEFAULT 25,
  big_blind bigint NOT NULL DEFAULT 50,
  max_players integer NOT NULL DEFAULT 9,
  min_buy_in bigint NOT NULL DEFAULT 1000,
  max_buy_in bigint NOT NULL DEFAULT 10000,
  
  -- Current Game State
  current_players integer DEFAULT 0,
  dealer_position integer DEFAULT 0,
  current_hand_number integer DEFAULT 0,
  
  -- Card State
  community_cards jsonb DEFAULT '[]'::jsonb,
  deck_cards jsonb DEFAULT '[]'::jsonb,
  
  -- Betting State
  pot bigint DEFAULT 0,
  current_bet bigint DEFAULT 0,
  current_player_seat integer,
  betting_round text DEFAULT 'waiting' CHECK (betting_round IN ('waiting', 'pre-flop', 'flop', 'turn', 'river', 'showdown')),
  
  -- Game Metadata
  game_state jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  is_private boolean DEFAULT false,
  password_hash text,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 21 Hold'em Players Table
CREATE TABLE IF NOT EXISTS holdem_21_players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES holdem_21_sessions(id) ON DELETE CASCADE,
  player_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Seat Information
  seat_position integer NOT NULL CHECK (seat_position >= 0 AND seat_position <= 8),
  
  -- Chip Information
  buy_in_amount bigint NOT NULL,
  current_chips bigint NOT NULL,
  total_wagered bigint DEFAULT 0,
  total_won bigint DEFAULT 0,
  
  -- Hand State
  hole_cards jsonb DEFAULT '[]'::jsonb,
  hand_total integer DEFAULT 0,
  is_blackjack boolean DEFAULT false,
  is_busted boolean DEFAULT false,
  
  -- Player Status
  player_status text DEFAULT 'active' CHECK (player_status IN ('active', 'folded', 'all-in', 'sitting-out', 'disconnected')),
  last_action text CHECK (last_action IN ('fold', 'call', 'raise', 'check', 'hit', 'stand', 'double-down')),
  current_bet bigint DEFAULT 0,
  
  -- Connection Status
  is_connected boolean DEFAULT true,
  is_ready boolean DEFAULT false,
  
  -- Timestamps
  joined_at timestamptz DEFAULT now(),
  last_seen timestamptz DEFAULT now(),
  
  UNIQUE(session_id, player_id),
  UNIQUE(session_id, seat_position)
);

-- 21 Hold'em Hands Table
CREATE TABLE IF NOT EXISTS holdem_21_hands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES holdem_21_sessions(id) ON DELETE CASCADE,
  hand_number integer NOT NULL,
  
  -- Hand Configuration
  dealer_position integer NOT NULL,
  small_blind_amount bigint NOT NULL,
  big_blind_amount bigint NOT NULL,
  
  -- Card Information
  community_cards jsonb DEFAULT '[]'::jsonb,
  deck_state jsonb DEFAULT '[]'::jsonb,
  
  -- Betting Information
  total_pot bigint DEFAULT 0,
  side_pots jsonb DEFAULT '[]'::jsonb,
  current_betting_round text DEFAULT 'pre-flop' CHECK (current_betting_round IN ('pre-flop', 'flop', 'turn', 'river', 'showdown')),
  current_bet bigint DEFAULT 0,
  current_player_position integer,
  
  -- Hand Status
  is_complete boolean DEFAULT false,
  winner_seats jsonb DEFAULT '[]'::jsonb,
  winning_hands jsonb DEFAULT '[]'::jsonb,
  
  -- Timestamps
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  
  UNIQUE(session_id, hand_number)
);

-- 21 Hold'em Actions Table
CREATE TABLE IF NOT EXISTS holdem_21_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES holdem_21_sessions(id) ON DELETE CASCADE,
  hand_id uuid NOT NULL REFERENCES holdem_21_hands(id) ON DELETE CASCADE,
  player_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Action Details
  seat_position integer NOT NULL,
  action_sequence integer NOT NULL,
  betting_round text NOT NULL CHECK (betting_round IN ('pre-flop', 'flop', 'turn', 'river', 'showdown')),
  action_type text NOT NULL CHECK (action_type IN ('fold', 'call', 'raise', 'check', 'hit', 'stand', 'double-down', 'ante')),
  amount bigint DEFAULT 0,
  
  -- Game State After Action
  pot_size_after bigint NOT NULL,
  player_chips_after bigint NOT NULL,
  player_cards jsonb DEFAULT '[]'::jsonb,
  hand_total_after integer DEFAULT 0,
  is_blackjack boolean DEFAULT false,
  is_busted boolean DEFAULT false,
  
  -- Metadata
  game_state_snapshot jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- 21 Hold'em Results Table
CREATE TABLE IF NOT EXISTS holdem_21_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES holdem_21_sessions(id) ON DELETE CASCADE,
  hand_id uuid NOT NULL REFERENCES holdem_21_hands(id) ON DELETE CASCADE,
  player_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Player Information
  seat_position integer NOT NULL,
  
  -- Final Hand State
  final_cards jsonb NOT NULL,
  final_hand_total integer NOT NULL,
  hand_rank text NOT NULL CHECK (hand_rank IN ('blackjack', 'twenty-one', 'twenty', 'nineteen', 'eighteen', 'seventeen', 'sixteen', 'fifteen', 'fourteen', 'thirteen', 'twelve', 'eleven', 'ten', 'nine', 'eight', 'seven', 'six', 'five', 'four', 'three', 'two', 'bust')),
  
  -- Result Information
  result_type text NOT NULL CHECK (result_type IN ('win', 'loss', 'push', 'blackjack')),
  amount_won bigint DEFAULT 0,
  amount_bet bigint NOT NULL,
  
  -- Chip Changes
  chips_before bigint NOT NULL,
  chips_after bigint NOT NULL,
  
  -- Special Conditions
  was_doubled_down boolean DEFAULT false,
  was_split_hand boolean DEFAULT false,
  
  created_at timestamptz DEFAULT now()
);

-- 21 Hold'em Player Statistics Table
CREATE TABLE IF NOT EXISTS holdem_21_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Game Statistics
  total_hands_played integer DEFAULT 0,
  total_hands_won integer DEFAULT 0,
  total_blackjacks integer DEFAULT 0,
  total_busts integer DEFAULT 0,
  total_double_downs integer DEFAULT 0,
  
  -- Financial Statistics
  total_wagered bigint DEFAULT 0,
  total_won bigint DEFAULT 0,
  biggest_win bigint DEFAULT 0,
  biggest_loss bigint DEFAULT 0,
  
  -- Session Statistics
  total_sessions integer DEFAULT 0,
  total_time_played interval DEFAULT '0 minutes',
  average_session_length interval DEFAULT '0 minutes',
  
  -- Advanced Statistics
  win_rate numeric(5,2) DEFAULT 0.00,
  blackjack_rate numeric(5,2) DEFAULT 0.00,
  bust_rate numeric(5,2) DEFAULT 0.00,
  average_hand_value numeric(4,2) DEFAULT 0.00,
  
  -- Streaks
  current_win_streak integer DEFAULT 0,
  longest_win_streak integer DEFAULT 0,
  current_loss_streak integer DEFAULT 0,
  longest_loss_streak integer DEFAULT 0,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_holdem_21_sessions_active ON holdem_21_sessions(is_active, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_holdem_21_sessions_code ON holdem_21_sessions(session_code);
CREATE INDEX IF NOT EXISTS idx_holdem_21_sessions_host ON holdem_21_sessions(host_id);

CREATE INDEX IF NOT EXISTS idx_holdem_21_players_session ON holdem_21_players(session_id);
CREATE INDEX IF NOT EXISTS idx_holdem_21_players_player ON holdem_21_players(player_id);
CREATE INDEX IF NOT EXISTS idx_holdem_21_players_connected ON holdem_21_players(session_id, is_connected);

CREATE INDEX IF NOT EXISTS idx_holdem_21_hands_session ON holdem_21_hands(session_id, hand_number DESC);
CREATE INDEX IF NOT EXISTS idx_holdem_21_hands_active ON holdem_21_hands(session_id, is_complete);

CREATE INDEX IF NOT EXISTS idx_holdem_21_actions_hand ON holdem_21_actions(hand_id, action_sequence);
CREATE INDEX IF NOT EXISTS idx_holdem_21_actions_player ON holdem_21_actions(player_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_holdem_21_results_player ON holdem_21_results(player_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_holdem_21_results_session ON holdem_21_results(session_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_holdem_21_stats_player ON holdem_21_stats(player_id);

-- Enable Row Level Security
ALTER TABLE holdem_21_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE holdem_21_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE holdem_21_hands ENABLE ROW LEVEL SECURITY;
ALTER TABLE holdem_21_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE holdem_21_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE holdem_21_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Sessions
CREATE POLICY "Users can create 21 holdem sessions"
  ON holdem_21_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Users can view sessions they're in"
  ON holdem_21_sessions
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = host_id OR 
    EXISTS (
      SELECT 1 FROM holdem_21_players 
      WHERE holdem_21_players.session_id = holdem_21_sessions.id 
      AND holdem_21_players.player_id = auth.uid()
    )
  );

CREATE POLICY "Hosts can update their sessions"
  ON holdem_21_sessions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = host_id)
  WITH CHECK (auth.uid() = host_id);

-- RLS Policies for Players
CREATE POLICY "Users can join 21 holdem sessions"
  ON holdem_21_players
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = player_id);

CREATE POLICY "Users can view session players"
  ON holdem_21_players
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM holdem_21_sessions 
      WHERE holdem_21_sessions.id = holdem_21_players.session_id 
      AND (
        holdem_21_sessions.host_id = auth.uid() OR 
        EXISTS (
          SELECT 1 FROM holdem_21_players sp2 
          WHERE sp2.session_id = holdem_21_sessions.id 
          AND sp2.player_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can update their own player data"
  ON holdem_21_players
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = player_id)
  WITH CHECK (auth.uid() = player_id);

-- RLS Policies for Hands
CREATE POLICY "Session participants can view 21 holdem hands"
  ON holdem_21_hands
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM holdem_21_players 
      WHERE holdem_21_players.session_id = holdem_21_hands.session_id 
      AND holdem_21_players.player_id = auth.uid()
    )
  );

CREATE POLICY "Session participants can create 21 holdem hands"
  ON holdem_21_hands
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM holdem_21_players 
      WHERE holdem_21_players.session_id = holdem_21_hands.session_id 
      AND holdem_21_players.player_id = auth.uid()
    )
  );

-- RLS Policies for Actions
CREATE POLICY "Users can record their own 21 holdem actions"
  ON holdem_21_actions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = player_id);

CREATE POLICY "Session participants can view 21 holdem actions"
  ON holdem_21_actions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM holdem_21_players 
      WHERE holdem_21_players.session_id = holdem_21_actions.session_id 
      AND holdem_21_players.player_id = auth.uid()
    )
  );

-- RLS Policies for Results
CREATE POLICY "Users can record their own 21 holdem results"
  ON holdem_21_results
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = player_id);

CREATE POLICY "Session participants can view 21 holdem results"
  ON holdem_21_results
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM holdem_21_players 
      WHERE holdem_21_players.session_id = holdem_21_results.session_id 
      AND holdem_21_players.player_id = auth.uid()
    )
  );

-- RLS Policies for Stats
CREATE POLICY "Users can read own 21 holdem stats"
  ON holdem_21_stats
  FOR SELECT
  TO authenticated
  USING (auth.uid() = player_id);

CREATE POLICY "Users can insert own 21 holdem stats"
  ON holdem_21_stats
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = player_id);

CREATE POLICY "Users can update own 21 holdem stats"
  ON holdem_21_stats
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = player_id)
  WITH CHECK (auth.uid() = player_id);

-- Create trigger functions for automatic updates
CREATE OR REPLACE FUNCTION update_holdem_21_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_holdem_21_stats_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_holdem_21_sessions_updated_at
  BEFORE UPDATE ON holdem_21_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_holdem_21_sessions_updated_at();

CREATE TRIGGER update_holdem_21_stats_updated_at
  BEFORE UPDATE ON holdem_21_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_holdem_21_stats_updated_at();

-- Function to update player count in sessions
CREATE OR REPLACE FUNCTION update_holdem_21_session_player_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE holdem_21_sessions 
    SET current_players = (
      SELECT COUNT(*) 
      FROM holdem_21_players 
      WHERE session_id = NEW.session_id 
      AND is_connected = true
    )
    WHERE id = NEW.session_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE holdem_21_sessions 
    SET current_players = (
      SELECT COUNT(*) 
      FROM holdem_21_players 
      WHERE session_id = OLD.session_id 
      AND is_connected = true
    )
    WHERE id = OLD.session_id;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE holdem_21_sessions 
    SET current_players = (
      SELECT COUNT(*) 
      FROM holdem_21_players 
      WHERE session_id = NEW.session_id 
      AND is_connected = true
    )
    WHERE id = NEW.session_id;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER holdem_21_session_player_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON holdem_21_players
  FOR EACH ROW
  EXECUTE FUNCTION update_holdem_21_session_player_count();