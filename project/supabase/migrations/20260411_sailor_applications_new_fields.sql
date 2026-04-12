-- Add new fields to sailor_applications table

-- Número do certificado médico
ALTER TABLE sailor_applications ADD COLUMN IF NOT EXISTS medico_numero TEXT;

-- URL do certificado de cozinheiro (chef)
ALTER TABLE sailor_applications ADD COLUMN IF NOT EXISTS chef_certificacoes_url TEXT;

-- URL da certidão de antecedentes criminais
ALTER TABLE sailor_applications ADD COLUMN IF NOT EXISTS antecedentes_criminais_url TEXT;
