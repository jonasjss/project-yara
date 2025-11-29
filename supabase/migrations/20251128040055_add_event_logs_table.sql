/*
  # Add Event Logs Table

  ## Descrição
  Tabela para armazenar logs de eventos do sistema, incluindo:
  - Detecções de câmera
  - Tentativas de reconhecimento facial
  - Correspondências e não-correspondências
  - Status da câmera

  ## Novas Tabelas

  ### `event_logs`
    - `id` (uuid, primary key)
    - `bus_id` (uuid, foreign key) - Ônibus onde o evento ocorreu
    - `event_type` (text) - Tipo: camera_online, camera_offline, detection_attempt, person_identified, no_match, alert_triggered
    - `message` (text) - Descrição do evento
    - `confidence_level` (numeric) - Nível de confiança (0-100), se aplicável
    - `suspect_id` (uuid, foreign key, nullable) - Suspeito identificado, se houver
    - `camera_frame_url` (text, nullable) - URL do frame capturado
    - `metadata` (jsonb) - Dados adicionais em JSON
    - `created_at` (timestamp)
*/

CREATE TABLE IF NOT EXISTS event_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bus_id uuid REFERENCES buses(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN ('camera_online', 'camera_offline', 'detection_attempt', 'person_identified', 'no_match', 'alert_triggered')),
  message text NOT NULL,
  confidence_level numeric CHECK (confidence_level >= 0 AND confidence_level <= 100),
  suspect_id uuid REFERENCES suspects(id) ON DELETE SET NULL,
  camera_frame_url text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE event_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read event logs"
  ON event_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert event logs"
  ON event_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_event_logs_bus_id ON event_logs(bus_id);
CREATE INDEX IF NOT EXISTS idx_event_logs_suspect_id ON event_logs(suspect_id);
CREATE INDEX IF NOT EXISTS idx_event_logs_event_type ON event_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_event_logs_created_at ON event_logs(created_at DESC);