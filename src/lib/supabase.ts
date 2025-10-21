import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Model {
  id: string;
  name: string;
  display_name: string;
  description: string;
  accuracy: number;
  auc?: number;
  trials?: number;
  is_recommended: boolean;
  created_at: string;
}

export interface CalibrationSession {
  id: string;
  model_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  jupyter_notebook_url?: string;
  started_at?: string;
  completed_at?: string;
  error_message?: string;
  calibration_data?: any;
  created_at: string;
}

export interface MonitoringSession {
  id: string;
  calibration_session_id?: string;
  status: 'active' | 'paused' | 'stopped';
  fatigue_detected: boolean;
  confidence_score?: number;
  session_data?: any;
  started_at: string;
  ended_at?: string;
}
