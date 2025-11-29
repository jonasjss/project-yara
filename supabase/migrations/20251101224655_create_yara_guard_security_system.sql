/*
  # YARA GUARD AI - Sistema de Segurança com Reconhecimento Facial

  ## Descrição
  Sistema completo de monitoramento de segurança em transporte público com reconhecimento facial,
  alertas em tempo real e rastreamento de suspeitos.

  ## Novas Tabelas

  ### 1. `companies` - Empresas de transporte
    - `id` (uuid, primary key)
    - `name` (text) - Nome da empresa (Líder, Eucatur, São Pedro)
    - `logo_url` (text) - URL do logo da empresa
    - `created_at` (timestamp)

  ### 2. `bus_lines` - Linhas de ônibus
    - `id` (uuid, primary key)
    - `line_number` (text) - Número da linha (ex: "302")
    - `name` (text) - Nome da linha
    - `company_id` (uuid, foreign key)
    - `created_at` (timestamp)

  ### 3. `buses` - Frota de ônibus
    - `id` (uuid, primary key)
    - `bus_number` (text) - Número identificador do ônibus
    - `plate` (text) - Placa do veículo
    - `line_id` (uuid, foreign key)
    - `company_id` (uuid, foreign key)
    - `status` (text) - Status: normal, alerta, emergencia
    - `latitude` (numeric) - Localização atual
    - `longitude` (numeric) - Localização atual
    - `last_update` (timestamp) - Última atualização de localização
    - `created_at` (timestamp)

  ### 4. `suspects` - Cadastro de suspeitos
    - `id` (uuid, primary key)
    - `name` (text) - Nome do suspeito
    - `photo_url` (text) - URL da foto do rosto
    - `criminal_record` (jsonb) - Histórico criminal em JSON
    - `risk_level` (text) - Nível de risco: baixo, medio, alto, critico
    - `last_seen_at` (timestamp) - Última vez visto
    - `created_at` (timestamp)

  ### 5. `detections` - Detecções de reconhecimento facial
    - `id` (uuid, primary key)
    - `suspect_id` (uuid, foreign key)
    - `bus_id` (uuid, foreign key)
    - `detected_at` (timestamp) - Momento da detecção
    - `confidence_level` (numeric) - Nível de confiança (0-100)
    - `photo_url` (text) - Foto capturada no momento
    - `latitude` (numeric) - Localização da detecção
    - `longitude` (numeric) - Localização da detecção
    - `status` (text) - Status: pendente, em_atendimento, resolvido
    - `created_at` (timestamp)

  ### 6. `alerts` - Histórico de alertas
    - `id` (uuid, primary key)
    - `detection_id` (uuid, foreign key)
    - `alert_type` (text) - Tipo: reconhecimento_facial, comportamento_suspeito, arma_detectada
    - `severity` (text) - Severidade: baixa, media, alta, critica
    - `message` (text) - Mensagem do alerta
    - `resolved` (boolean) - Se foi resolvido
    - `resolved_at` (timestamp)
    - `created_at` (timestamp)

  ## Segurança
  - RLS habilitado em todas as tabelas
  - Políticas para usuários autenticados
*/

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  logo_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read companies"
  ON companies FOR SELECT
  TO authenticated
  USING (true);

-- Bus lines table
CREATE TABLE IF NOT EXISTS bus_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  line_number text NOT NULL,
  name text NOT NULL,
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE bus_lines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read bus lines"
  ON bus_lines FOR SELECT
  TO authenticated
  USING (true);

-- Buses table
CREATE TABLE IF NOT EXISTS buses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bus_number text NOT NULL,
  plate text NOT NULL UNIQUE,
  line_id uuid REFERENCES bus_lines(id) ON DELETE SET NULL,
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  status text DEFAULT 'normal' CHECK (status IN ('normal', 'alerta', 'emergencia')),
  latitude numeric,
  longitude numeric,
  last_update timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE buses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read buses"
  ON buses FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to update buses"
  ON buses FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Suspects table
CREATE TABLE IF NOT EXISTS suspects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  photo_url text NOT NULL,
  criminal_record jsonb DEFAULT '[]'::jsonb,
  risk_level text DEFAULT 'medio' CHECK (risk_level IN ('baixo', 'medio', 'alto', 'critico')),
  last_seen_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE suspects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read suspects"
  ON suspects FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to update suspects"
  ON suspects FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Detections table
CREATE TABLE IF NOT EXISTS detections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  suspect_id uuid REFERENCES suspects(id) ON DELETE CASCADE,
  bus_id uuid REFERENCES buses(id) ON DELETE CASCADE,
  detected_at timestamptz DEFAULT now(),
  confidence_level numeric CHECK (confidence_level >= 0 AND confidence_level <= 100),
  photo_url text,
  latitude numeric,
  longitude numeric,
  status text DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_atendimento', 'resolvido')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE detections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read detections"
  ON detections FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert detections"
  ON detections FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update detections"
  ON detections FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Alerts table
CREATE TABLE IF NOT EXISTS alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  detection_id uuid REFERENCES detections(id) ON DELETE CASCADE,
  alert_type text NOT NULL CHECK (alert_type IN ('reconhecimento_facial', 'comportamento_suspeito', 'arma_detectada')),
  severity text DEFAULT 'media' CHECK (severity IN ('baixa', 'media', 'alta', 'critica')),
  message text NOT NULL,
  resolved boolean DEFAULT false,
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read alerts"
  ON alerts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert alerts"
  ON alerts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update alerts"
  ON alerts FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_buses_status ON buses(status);
CREATE INDEX IF NOT EXISTS idx_buses_line_id ON buses(line_id);
CREATE INDEX IF NOT EXISTS idx_detections_suspect_id ON detections(suspect_id);
CREATE INDEX IF NOT EXISTS idx_detections_bus_id ON detections(bus_id);
CREATE INDEX IF NOT EXISTS idx_detections_status ON detections(status);
CREATE INDEX IF NOT EXISTS idx_alerts_detection_id ON alerts(detection_id);
CREATE INDEX IF NOT EXISTS idx_alerts_resolved ON alerts(resolved);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at DESC);