-- Add album (photo gallery) and disponibilidade (availability multi-select) to sailors table
ALTER TABLE sailors ADD COLUMN IF NOT EXISTS album jsonb DEFAULT '[]'::jsonb;
ALTER TABLE sailors ADD COLUMN IF NOT EXISTS disponibilidade jsonb DEFAULT '[]'::jsonb;
