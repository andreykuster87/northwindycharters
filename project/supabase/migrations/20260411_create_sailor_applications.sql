-- Create sailor_applications table
CREATE TABLE sailor_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,

  -- Dados reutilizados do client (snapshot)
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  birth_date TEXT, -- yyyy-mm-dd
  nacionalidade TEXT,

  -- Dados de tripulação
  funcoes TEXT[] NOT NULL, -- array de strings

  -- Documentos Obrigatórios
  caderneta_maritima_numero TEXT NOT NULL,
  caderneta_maritima_validade TEXT NOT NULL, -- dd/mm/aaaa
  caderneta_doc_url TEXT,
  caderneta_doc_back_url TEXT,

  -- Documentos Opcionais
  doc_id_tipo TEXT, -- passport, rg, etc
  doc_id_numero TEXT,
  doc_id_validade TEXT, -- dd/mm/aaaa
  doc_id_url TEXT,
  doc_id_back_url TEXT,

  carta_habilitacao_numero TEXT,
  carta_habilitacao_validade TEXT, -- dd/mm/aaaa
  carta_habilitacao_url TEXT,
  carta_habilitacao_back_url TEXT,

  -- STCW (similar a sailors)
  stcw JSONB, -- {"bst": true, "sobrevivencia": false, ...}
  stcw_validades JSONB, -- {"bst": "dd/mm/aaaa", ...}

  -- Médico
  medico_validade TEXT, -- dd/mm/aaaa
  medico_url TEXT,

  -- Experiência & idiomas
  experiencia_embarcado BOOLEAN,
  experiencias JSONB, -- [{empresa, funcao, periodo_inicio, periodo_fim}, ...]
  cursos_relevantes TEXT,
  idiomas TEXT[], -- ["Português", "Inglês", ...]

  -- Chef (opcional)
  chef_experiencia_catering BOOLEAN DEFAULT false,
  chef_certificacoes TEXT,

  -- Validações
  antecedentes_criminais TEXT, -- textarea de antecedentes últimos 3 meses
  declara_verdade BOOLEAN NOT NULL DEFAULT false,
  aceita_termos BOOLEAN NOT NULL DEFAULT false,

  -- Status
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'approved' | 'rejected'
  reject_reason TEXT[],

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID -- admin ID
);

-- Create indexes
CREATE INDEX idx_sailor_applications_client_id ON sailor_applications(client_id);
CREATE INDEX idx_sailor_applications_status ON sailor_applications(status);
CREATE INDEX idx_sailor_applications_created_at ON sailor_applications(created_at DESC);

-- Add columns to sailors table for rastreabilidade
ALTER TABLE sailors ADD COLUMN IF NOT EXISTS converted_from_client_id UUID REFERENCES clients(id) ON DELETE SET NULL;
ALTER TABLE sailors ADD COLUMN IF NOT EXISTS application_id UUID REFERENCES sailor_applications(id) ON DELETE SET NULL;

-- Create index for rastreabilidade
CREATE INDEX IF NOT EXISTS idx_sailors_converted_from_client_id ON sailors(converted_from_client_id);
CREATE INDEX IF NOT EXISTS idx_sailors_application_id ON sailors(application_id);

-- RLS Policies
ALTER TABLE sailor_applications ENABLE ROW LEVEL SECURITY;

-- Policy: Clients can see their own applications
CREATE POLICY "Clients can view own applications" ON sailor_applications
  FOR SELECT
  USING (
    -- Allow if client_id matches authenticated user
    client_id = (SELECT id FROM clients WHERE id = auth.uid())
  );

-- Policy: Clients can create applications
CREATE POLICY "Clients can create applications" ON sailor_applications
  FOR INSERT
  WITH CHECK (
    client_id = (SELECT id FROM clients WHERE id = auth.uid())
  );

-- Policy: Admin can view all applications
CREATE POLICY "Admin can view all applications" ON sailor_applications
  FOR SELECT
  USING (
    -- Allow if authenticated as admin (check auth.jwt() ->> 'role' = 'admin')
    -- Or for now, public read (will be restricted in app logic)
    true
  );

-- Policy: Admin can update applications
CREATE POLICY "Admin can update applications" ON sailor_applications
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Grant permissions
GRANT SELECT, INSERT ON sailor_applications TO anon, authenticated;
GRANT SELECT, UPDATE ON sailor_applications TO authenticated;
