-- Add outras_informacoes (biography) field to clients table
-- Enables the editable "Biografia" section in the passenger public profile.

ALTER TABLE clients ADD COLUMN IF NOT EXISTS outras_informacoes text;
