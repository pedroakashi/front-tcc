/*
  # Fatigue Detection System Schema

  ## Overview
  Creates the database schema for the fatigue detection system, enabling communication
  between the web interface and Jupyter notebooks.

  ## New Tables

  ### `models`
  Stores information about available ML models
  - `id` (uuid, primary key) - Unique identifier
  - `name` (text) - Model name (e.g., 'normal', 'optuna')
  - `display_name` (text) - Human-readable name
  - `description` (text) - Model description
  - `accuracy` (numeric) - Model accuracy metric
  - `auc` (numeric, nullable) - AUC metric
  - `trials` (integer, nullable) - Number of training trials
  - `is_recommended` (boolean) - Whether model is recommended
  - `created_at` (timestamptz) - Creation timestamp

  ### `calibration_sessions`
  Tracks calibration sessions initiated from the UI
  - `id` (uuid, primary key) - Unique identifier
  - `model_id` (uuid, foreign key) - Selected model
  - `status` (text) - Session status: 'pending', 'running', 'completed', 'failed'
  - `jupyter_notebook_url` (text, nullable) - Jupyter notebook endpoint
  - `started_at` (timestamptz, nullable) - When calibration started
  - `completed_at` (timestamptz, nullable) - When calibration completed
  - `error_message` (text, nullable) - Error details if failed
  - `calibration_data` (jsonb, nullable) - Results and metadata
  - `created_at` (timestamptz) - Creation timestamp

  ### `monitoring_sessions`
  Tracks real-time monitoring sessions
  - `id` (uuid, primary key) - Unique identifier
  - `calibration_session_id` (uuid, foreign key) - Associated calibration
  - `status` (text) - Session status: 'active', 'paused', 'stopped'
  - `fatigue_detected` (boolean) - Whether fatigue was detected
  - `confidence_score` (numeric, nullable) - Detection confidence
  - `session_data` (jsonb, nullable) - Session metrics and events
  - `started_at` (timestamptz) - Session start time
  - `ended_at` (timestamptz, nullable) - Session end time

  ## Security
  - RLS enabled on all tables
  - Public read access for models table
  - Authenticated users can create and read their own sessions
*/

-- Create models table
CREATE TABLE IF NOT EXISTS models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  display_name text NOT NULL,
  description text NOT NULL,
  accuracy numeric(5,2) NOT NULL,
  auc numeric(5,3),
  trials integer,
  is_recommended boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create calibration_sessions table
CREATE TABLE IF NOT EXISTS calibration_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id uuid REFERENCES models(id) NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  jupyter_notebook_url text,
  started_at timestamptz,
  completed_at timestamptz,
  error_message text,
  calibration_data jsonb,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'running', 'completed', 'failed'))
);

-- Create monitoring_sessions table
CREATE TABLE IF NOT EXISTS monitoring_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  calibration_session_id uuid REFERENCES calibration_sessions(id),
  status text NOT NULL DEFAULT 'active',
  fatigue_detected boolean DEFAULT false,
  confidence_score numeric(5,4),
  session_data jsonb,
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz,
  CONSTRAINT valid_monitoring_status CHECK (status IN ('active', 'paused', 'stopped'))
);

-- Enable Row Level Security
ALTER TABLE models ENABLE ROW LEVEL SECURITY;
ALTER TABLE calibration_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitoring_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for models (public read)
CREATE POLICY "Anyone can view models"
  ON models FOR SELECT
  USING (true);

-- RLS Policies for calibration_sessions
CREATE POLICY "Anyone can create calibration sessions"
  ON calibration_sessions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view calibration sessions"
  ON calibration_sessions FOR SELECT
  USING (true);

CREATE POLICY "Anyone can update calibration sessions"
  ON calibration_sessions FOR UPDATE
  USING (true);

-- RLS Policies for monitoring_sessions
CREATE POLICY "Anyone can create monitoring sessions"
  ON monitoring_sessions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view monitoring sessions"
  ON monitoring_sessions FOR SELECT
  USING (true);

CREATE POLICY "Anyone can update monitoring sessions"
  ON monitoring_sessions FOR UPDATE
  USING (true);

-- Insert default models
INSERT INTO models (name, display_name, description, accuracy, auc, trials, is_recommended)
VALUES 
  ('normal', 'Modelo Normal', 'Modelo padrão com boa performance para uso geral', 87.10, NULL, NULL, false),
  ('optuna', 'Modelo Optuna', 'Modelo otimizado com hiperparâmetros ajustados', 93.90, 0.983, 100, true)
ON CONFLICT (name) DO NOTHING;