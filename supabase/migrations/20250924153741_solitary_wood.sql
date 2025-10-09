/*
  # Create separate 21 Hold'em schema

  1. New Schema
    - Create `holdem_21` schema for complete separation
    - Move all 21 Hold'em tables to dedicated schema
    - Set up proper permissions and RLS

  2. Tables in holdem_21 schema
    - sessions (game sessions/tables)
    - players (players in sessions)
    - hands (individual hands played)
    - actions (player actions)
    - results (hand results)
    - stats (player statistics)

  3. Security
    - Enable RLS on all tables
    - Copy existing policies to new schema
    - Grant proper access permissions
*/

-- Create the holdem_21 schema
CREATE SCHEMA IF NOT EXISTS holdem_21;

-- Grant usage on schema
GRANT USAGE ON SCHEMA holdem_21 TO authenticated;
GRANT USAGE ON SCHEMA holdem_21 TO anon;

-- Sessions table
CREATE TABLE IF NOT EXISTS holdem_21.sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_code text UNIQUE NOT NULL,
  table_name text NOT NULL DEFAULT '21-holdem-default',
  host_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  small_blind bigint NOT NULL DEFAULT 25,
  big_blind bigint NOT NULL DEFAULT 50,
  max_players integer NOT NULL DEFAULT 9,
  min_buy_in bigint NOT NULL DEFAULT 1000,
  max_buy_in bigint NOT NULL DEFAULT 10000,
  current_players integer DEFAULT 0,
  dealer_position integer DEFAULT 0,
  current_hand_number integer DEFAULT 0,
  community_cards jsonb DEFAULT '[]',
  deck_cards jsonb DEFAULT '[]',
  pot bigint DEFAULT 0,
  current_bet bigint DEFAULT 0,
  current_player_seat integer,
  betting_round text DEFAULT 'waiting' CHECK (betting_round IN ('waiting', 'pre-flop', 'flop', 'turn', 'river', 'showdown')),
  game_state jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  is_private boolean DEFAULT false,
  password_hash text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Players table
CREATE TABLE IF NOT EXISTS holdem_21.players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES holdem_21.sessions(id) ON DELETE CASCADE,
  player_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  seat_position integer NOT NULL CHECK (seat_position >= 0 AND seat_position <= 8),
  buy_in_amount bigint NOT NULL,
  current_chips bigint NOT NULL,
  total_wagered bigint DEFAULT 0,
  total_won bigint DEFAULT 0,
  hole_cards jsonb DEFAULT '[]',
  hand_total integer DEFAULT 0,
  is_blackjack boolean DEFAULT false,
  is_busted boolean DEFAULT false,
  player_status text DEFAULT 'active' CHECK (player_status IN ('active', 'folded', 'all-in', 'sitting-out', 'disconnected')),
  last_action text CHECK (last_action IN ('fold', 'call', 'raise', 'check', 'hit', 'stand', 'double-down')),
  current_bet bigint DEFAULT 0,
  is_connected boolean DEFAULT true,
  is_ready boolean DEFAULT false,
  joined_at timestamptz DEFAULT now(),
  last_seen timestamptz DEFAULT now(),
  UNIQUE(session_id, player_id),
  UNIQUE(session_id, seat_position)
);

-- Hands table
CREATE TABLE IF NOT EXISTS holdem_21.hands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES holdem_21.sessions(id) ON DELETE CASCADE,
  hand_number integer NOT NULL,
  dealer_position integer NOT NULL,
  small_blind_amount bigint NOT NULL,
  big_blind_amount bigint NOT NULL,
  community_cards jsonb DEFAULT '[]',
  deck_state jsonb DEFAULT '[]',
  total_pot bigint DEFAULT 0,
  side_pots jsonb DEFAULT '[]',
  current_betting_round text DEFAULT 'pre-flop' CHECK (current_betting_round IN ('pre-flop', 'flop', 'turn', 'river', 'showdown')),
  current_bet bigint DEFAULT 0,
  current_player_position integer,
  is_complete boolean DEFAULT false,
  winner_seats jsonb DEFAULT '[]',
  winning_hands jsonb DEFAULT '[]',
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  UNIQUE(session_id, hand_number)
);

-- Actions table
CREATE TABLE IF NOT EXISTS holdem_21.actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES holdem_21.sessions(id) ON DELETE CASCADE,
  hand_id uuid NOT NULL REFERENCES holdem_21.hands(id) ON DELETE CASCADE,
  player_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  seat_position integer NOT NULL,
  action_sequence integer NOT NULL,
  betting_round text NOT NULL CHECK (betting_round IN ('pre-flop', 'flop', 'turn', 'river', 'showdown')),
  action_type text NOT NULL CHECK (action_type IN ('fold', 'call', 'raise', 'check', 'hit', 'stand', 'double-down', 'ante')),
  amount bigint DEFAULT 0,
  pot_size_after bigint NOT NULL,
  player_chips_after bigint NOT NULL,
  player_cards jsonb DEFAULT '[]',
  hand_total_after integer DEFAULT 0,
  is_blackjack boolean DEFAULT false,
  is_busted boolean DEFAULT false,
  game_state_snapshot jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Results table
CREATE TABLE IF NOT EXISTS holdem_21.results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES holdem_21.sessions(id) ON DELETE CASCADE,
  hand_id uuid NOT NULL REFERENCES holdem_21.hands(id) ON DELETE CASCADE,
  player_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  seat_position integer NOT NULL,
  final_cards jsonb NOT NULL,
  final_hand_total integer NOT NULL,
  hand_rank text NOT NULL CHECK (hand_rank IN ('blackjack', 'twenty-one', 'twenty', 'nineteen', 'eighteen', 'seventeen', 'sixteen', 'fifteen', 'fourteen', 'thirteen', 'twelve', 'eleven', 'ten', 'nine', 'eight', 'seven', 'six', 'five', 'four', 'three', 'two', 'bust')),
  result_type text NOT NULL CHECK (result_type IN ('win', 'loss', 'push', 'blackjack')),
  amount_won bigint DEFAULT 0,
  amount_bet bigint NOT NULL,
  chips_before bigint NOT NULL,
  chips_after bigint NOT NULL,
  was_doubled_down boolean DEFAULT false,
  was_split_hand boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Stats table
CREATE TABLE IF NOT EXISTS holdem_21.stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  total_hands_played integer DEFAULT 0,
  total_hands_won integer DEFAULT 0,
  total_blackjacks integer DEFAULT 0,
  total_busts integer DEFAULT 0,
  total_double_downs integer DEFAULT 0,
  total_wagered bigint DEFAULT 0,
  total_won bigint DEFAULT 0,
  biggest_win bigint DEFAULT 0,
  biggest_loss bigint DEFAULT 0,
  total_sessions integer DEFAULT 0,
  total_time_played interval DEFAULT '00:00:00',
  average_session_length interval DEFAULT '00:00:00',
  win_rate numeric(5,2) DEFAULT 0.00,
  blackjack_rate numeric(5,2) DEFAULT 0.00,
  bust_rate numeric(5,2) DEFAULT 0.00,
  average_hand_value numeric(4,2) DEFAULT 0.00,
  current_win_streak integer DEFAULT 0,
  longest_win_streak integer DEFAULT 0,
  current_loss_streak integer DEFAULT 0,
  longest_loss_streak integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_holdem_21_sessions_active ON holdem_21.sessions(is_active, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_holdem_21_sessions_code ON holdem_21.sessions(session_code);
CREATE INDEX IF NOT EXISTS idx_holdem_21_sessions_host ON holdem_21.sessions(host_id);

CREATE INDEX IF NOT EXISTS idx_holdem_21_players_session ON holdem_21.players(session_id);
CREATE INDEX IF NOT EXISTS idx_holdem_21_players_player ON holdem_21.players(player_id);
CREATE INDEX IF NOT EXISTS idx_holdem_21_players_connected ON holdem_21.players(session_id, is_connected);

CREATE INDEX IF NOT EXISTS idx_holdem_21_hands_session ON holdem_21.hands(session_id, hand_number DESC);
CREATE INDEX IF NOT EXISTS idx_holdem_21_hands_active ON holdem_21.hands(session_id, is_complete);

CREATE INDEX IF NOT EXISTS idx_holdem_21_actions_hand ON holdem_21.actions(hand_id, action_sequence);
CREATE INDEX IF NOT EXISTS idx_holdem_21_actions_player ON holdem_21.actions(player_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_holdem_21_results_session ON holdem_21.results(session_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_holdem_21_results_player ON holdem_21.results(player_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_holdem_21_stats_player ON holdem_21.stats(player_id);

-- Enable RLS on all tables
ALTER TABLE holdem_21.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE holdem_21.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE holdem_21.hands ENABLE ROW LEVEL SECURITY;
ALTER TABLE holdem_21.actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE holdem_21.results ENABLE ROW LEVEL SECURITY;
ALTER TABLE holdem_21.stats ENABLE ROW LEVEL SECURITY;

-- Sessions policies
CREATE POLICY "Users can create 21 holdem sessions" ON holdem_21.sessions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Users can view sessions they're in" ON holdem_21.sessions
  FOR SELECT TO authenticated
  USING (
    auth.uid() = host_id OR 
    EXISTS (
      SELECT 1 FROM holdem_21.players 
      WHERE players.session_id = sessions.id 
      AND players.player_id = auth.uid()
    )
  );

CREATE POLICY "Hosts can update their sessions" ON holdem_21.sessions
  FOR UPDATE TO authenticated
  USING (auth.uid() = host_id)
  WITH CHECK (auth.uid() = host_id);

-- Players policies
CREATE POLICY "Users can join 21 holdem sessions" ON holdem_21.players
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = player_id);

CREATE POLICY "Users can view session players" ON holdem_21.players
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM holdem_21.sessions 
      WHERE sessions.id = players.session_id 
      AND (sessions.host_id = auth.uid() OR 
           EXISTS (SELECT 1 FROM holdem_21.players sp2 
                  WHERE sp2.session_id = sessions.id 
                  AND sp2.player_id = auth.uid()))
    )
  );

CREATE POLICY "Users can update their own player data" ON holdem_21.players
  FOR UPDATE TO authenticated
  USING (auth.uid() = player_id)
  WITH CHECK (auth.uid() = player_id);

-- Hands policies
CREATE POLICY "Session participants can create 21 holdem hands" ON holdem_21.hands
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM holdem_21.players 
      WHERE players.session_id = hands.session_id 
      AND players.player_id = auth.uid()
    )
  );

CREATE POLICY "Session participants can view 21 holdem hands" ON holdem_21.hands
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM holdem_21.players 
      WHERE players.session_id = hands.session_id 
      AND players.player_id = auth.uid()
    )
  );

-- Actions policies
CREATE POLICY "Users can record their own 21 holdem actions" ON holdem_21.actions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = player_id);

CREATE POLICY "Session participants can view 21 holdem actions" ON holdem_21.actions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM holdem_21.players 
      WHERE players.session_id = actions.session_id 
      AND players.player_id = auth.uid()
    )
  );

-- Results policies
CREATE POLICY "Users can record their own 21 holdem results" ON holdem_21.results
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = player_id);

CREATE POLICY "Session participants can view 21 holdem results" ON holdem_21.results
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM holdem_21.players 
      WHERE players.session_id = results.session_id 
      AND players.player_id = auth.uid()
    )
  );

-- Stats policies
CREATE POLICY "Users can insert own 21 holdem stats" ON holdem_21.stats
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = player_id);

CREATE POLICY "Users can read own 21 holdem stats" ON holdem_21.stats
  FOR SELECT TO authenticated
  USING (auth.uid() = player_id);

CREATE POLICY "Users can update own 21 holdem stats" ON holdem_21.stats
  FOR UPDATE TO authenticated
  USING (auth.uid() = player_id)
  WITH CHECK (auth.uid() = player_id);

-- Create trigger functions for updated_at
CREATE OR REPLACE FUNCTION holdem_21.update_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION holdem_21.update_stats_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_holdem_21_sessions_updated_at
  BEFORE UPDATE ON holdem_21.sessions
  FOR EACH ROW EXECUTE FUNCTION holdem_21.update_sessions_updated_at();

CREATE TRIGGER update_holdem_21_stats_updated_at
  BEFORE UPDATE ON holdem_21.stats
  FOR EACH ROW EXECUTE FUNCTION holdem_21.update_stats_updated_at();

-- Create function to update player count
CREATE OR REPLACE FUNCTION holdem_21.update_session_player_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE holdem_21.sessions 
    SET current_players = (
      SELECT COUNT(*) FROM holdem_21.players 
      WHERE session_id = NEW.session_id AND is_connected = true
    )
    WHERE id = NEW.session_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE holdem_21.sessions 
    SET current_players = (
      SELECT COUNT(*) FROM holdem_21.players 
      WHERE session_id = NEW.session_id AND is_connected = true
    )
    WHERE id = NEW.session_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE holdem_21.sessions 
    SET current_players = (
      SELECT COUNT(*) FROM holdem_21.players 
      WHERE session_id = OLD.session_id AND is_connected = true
    )
    WHERE id = OLD.session_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for player count updates
CREATE TRIGGER holdem_21_session_player_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON holdem_21.players
  FOR EACH ROW EXECUTE FUNCTION holdem_21.update_session_player_count();

-- Grant permissions on all tables
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA holdem_21 TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA holdem_21 TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA holdem_21 TO authenticated;