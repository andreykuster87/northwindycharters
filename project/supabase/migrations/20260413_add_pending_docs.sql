-- Add pending_docs column to sailors table
-- Stores pending document submissions for admin review workflow
ALTER TABLE sailors ADD COLUMN IF NOT EXISTS pending_docs jsonb DEFAULT NULL;
