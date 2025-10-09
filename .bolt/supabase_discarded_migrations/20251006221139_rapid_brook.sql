/*
  # Add foreign key relationship between game_results and profiles

  1. Foreign Key Constraint
    - Add foreign key from game_results.user_id to profiles.id
    - Enable CASCADE delete to maintain referential integrity
  
  2. Index
    - Add index on user_id for better query performance
*/

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_game_results_user_id' 
    AND table_name = 'game_results'
  ) THEN
    ALTER TABLE public.game_results
    ADD CONSTRAINT fk_game_results_user_id
    FOREIGN KEY (user_id)
    REFERENCES public.profiles(id)
    ON DELETE CASCADE;
  END IF;
END $$;

-- Add index for better performance if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_game_results_user_id_profile'
  ) THEN
    CREATE INDEX idx_game_results_user_id_profile ON public.game_results(user_id);
  END IF;
END $$;