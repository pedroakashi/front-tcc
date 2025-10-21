import { supabase } from './supabase';
import type { Model, CalibrationSession } from './supabase';

const EDGE_FUNCTION_BASE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

export async function getModels(): Promise<Model[]> {
  const { data, error } = await supabase
    .from('models')
    .select('*')
    .order('is_recommended', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch models: ${error.message}`);
  }

  return data || [];
}

export async function startCalibration(
  modelId: string,
  jupyterNotebookUrl: string
): Promise<{ sessionId: string; data: any }> {
  const response = await fetch(`${EDGE_FUNCTION_BASE_URL}/start-calibration`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      modelId,
      jupyterNotebookUrl,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to start calibration');
  }

  const result = await response.json();
  return result;
}

export async function getCalibrationSession(sessionId: string): Promise<CalibrationSession> {
  const { data, error } = await supabase
    .from('calibration_sessions')
    .select('*')
    .eq('id', sessionId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch calibration session: ${error.message}`);
  }

  if (!data) {
    throw new Error('Calibration session not found');
  }

  return data;
}

export async function updateCalibrationStatus(
  sessionId: string,
  status: string,
  calibrationData?: any,
  errorMessage?: string
): Promise<CalibrationSession> {
  const response = await fetch(`${EDGE_FUNCTION_BASE_URL}/update-calibration-status`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      sessionId,
      status,
      calibrationData,
      errorMessage,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to update calibration status');
  }

  const result = await response.json();
  return result.session;
}

export function subscribeToCalibrationSession(
  sessionId: string,
  callback: (session: CalibrationSession) => void
) {
  const channel = supabase
    .channel(`calibration_session_${sessionId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'calibration_sessions',
        filter: `id=eq.${sessionId}`,
      },
      (payload) => {
        callback(payload.new as CalibrationSession);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
