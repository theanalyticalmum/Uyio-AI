-- ==============================================================================
-- GUEST MODE SCHEMA ADDITIONS
-- ==============================================================================
-- Run this to add guest tracking to your existing database
-- ==============================================================================

-- Add guest tracking table
CREATE TABLE IF NOT EXISTS guest_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  total_sessions INTEGER DEFAULT 0 NOT NULL,
  last_practice TIMESTAMPTZ,
  daily_sessions INTEGER DEFAULT 0 NOT NULL,
  daily_reset_at DATE DEFAULT CURRENT_DATE NOT NULL,
  best_score JSONB,
  converted_to_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  converted_at TIMESTAMPTZ
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_guest_sessions_guest_id ON guest_sessions(guest_id);
CREATE INDEX IF NOT EXISTS idx_guest_sessions_converted ON guest_sessions(converted_to_user_id);

-- Add is_guest flag to sessions table
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS is_guest BOOLEAN DEFAULT FALSE;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS guest_id TEXT;

-- Add index for guest sessions
CREATE INDEX IF NOT EXISTS idx_sessions_guest_id ON sessions(guest_id) WHERE guest_id IS NOT NULL;

-- Enable RLS on guest_sessions table
ALTER TABLE guest_sessions ENABLE ROW LEVEL SECURITY;

-- Guest sessions are public (no auth required)
CREATE POLICY "Anyone can create guest sessions"
  ON guest_sessions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view their own guest session"
  ON guest_sessions FOR SELECT
  USING (true);

CREATE POLICY "Anyone can update their own guest session"
  ON guest_sessions FOR UPDATE
  USING (true);

-- Function to migrate guest data to user account
CREATE OR REPLACE FUNCTION migrate_guest_to_user(
  p_guest_id TEXT,
  p_user_id UUID
)
RETURNS VOID AS $$
BEGIN
  -- Mark guest session as converted
  UPDATE guest_sessions
  SET 
    converted_to_user_id = p_user_id,
    converted_at = NOW()
  WHERE guest_id = p_guest_id;

  -- Optional: Could migrate guest sessions to user's profile
  -- This depends on your business logic
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- ROLLBACK COMMANDS (Keep commented)
-- ==============================================================================

/*
DROP FUNCTION IF EXISTS migrate_guest_to_user(TEXT, UUID);
DROP INDEX IF EXISTS idx_sessions_guest_id;
ALTER TABLE sessions DROP COLUMN IF EXISTS guest_id;
ALTER TABLE sessions DROP COLUMN IF EXISTS is_guest;
DROP INDEX IF EXISTS idx_guest_sessions_converted;
DROP INDEX IF EXISTS idx_guest_sessions_guest_id;
DROP TABLE IF EXISTS guest_sessions CASCADE;
*/


