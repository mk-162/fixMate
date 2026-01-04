-- Add agent_muted column to issues table
-- This allows property managers to disable AI responses for sensitive issues

ALTER TABLE issues ADD COLUMN IF NOT EXISTS agent_muted BOOLEAN DEFAULT FALSE;

-- Add index for quick lookups
CREATE INDEX IF NOT EXISTS idx_issues_agent_muted ON issues(agent_muted) WHERE agent_muted = TRUE;
