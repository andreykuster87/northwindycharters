-- Add endereco (address) field to clients table
-- Enables the editable "Dados Pessoais" form in the client Configurações area.

ALTER TABLE clients ADD COLUMN IF NOT EXISTS endereco text;
