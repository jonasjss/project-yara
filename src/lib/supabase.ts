import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Company = {
  id: string;
  name: string;
  logo_url: string | null;
  created_at: string;
};

export type BusLine = {
  id: string;
  line_number: string;
  name: string;
  company_id: string;
  created_at: string;
};

export type Bus = {
  id: string;
  bus_number: string;
  plate: string;
  line_id: string | null;
  company_id: string;
  status: 'normal' | 'alerta' | 'emergencia';
  latitude: number | null;
  longitude: number | null;
  last_update: string;
  created_at: string;
};

export type Suspect = {
  id: string;
  name: string;
  photo_url: string;
  criminal_record: Array<{
    crime: string;
    data: string;
    local: string;
  }>;
  risk_level: 'baixo' | 'medio' | 'alto' | 'critico';
  last_seen_at: string | null;
  created_at: string;
};

export type Detection = {
  id: string;
  suspect_id: string;
  bus_id: string;
  detected_at: string;
  confidence_level: number;
  photo_url: string | null;
  latitude: number | null;
  longitude: number | null;
  status: 'pendente' | 'em_atendimento' | 'resolvido';
  created_at: string;
};

export type Alert = {
  id: string;
  detection_id: string;
  alert_type: 'reconhecimento_facial' | 'comportamento_suspeito' | 'arma_detectada';
  severity: 'baixa' | 'media' | 'alta' | 'critica';
  message: string;
  resolved: boolean;
  resolved_at: string | null;
  created_at: string;
};

export type EventLog = {
  id: string;
  bus_id: string;
  event_type: 'camera_online' | 'camera_offline' | 'detection_attempt' | 'person_identified' | 'no_match' | 'alert_triggered';
  message: string;
  confidence_level: number | null;
  suspect_id: string | null;
  camera_frame_url: string | null;
  metadata: Record<string, any>;
  created_at: string;
};
