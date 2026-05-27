/*
  # PeakOS Database Schema

  1. New Tables
    - `daily_missions`: User's 1-3 daily missions with priority and status
    - `non_negotiables`: Fixed daily habits checklist with streak tracking
    - `deep_work_sessions`: Track deep work timer sessions
    - `daily_journals`: Daily reflection questions and answers
    - `time_logs`: Manual time tracking by category
    - `feedback_entries`: User suggestions and feedback
    - `user_daily_stats`: Aggregated daily statistics

  2. Security
    - Enable RLS on all tables
    - Policies ensure users can only access their own data
*/

-- Daily Missions (1-3 per day)
CREATE TABLE IF NOT EXISTS daily_missions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  title text NOT NULL,
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  status text NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'doing', 'done')),
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Non-Negotiable Daily Habits
CREATE TABLE IF NOT EXISTS non_negotiables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  name text NOT NULL,
  is_completed boolean DEFAULT false,
  current_streak integer DEFAULT 0,
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

-- Deep Work Sessions
CREATE TABLE IF NOT EXISTS deep_work_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  duration_seconds integer NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz
);

-- Daily Journal Entries
CREATE TABLE IF NOT EXISTS daily_journals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  date date NOT NULL DEFAULT CURRENT_DATE UNIQUE,
  achievements text DEFAULT '',
  time_wasters text DEFAULT '',
  hardest_part text DEFAULT '',
  improvements text DEFAULT '',
  energy_level integer CHECK (energy_level BETWEEN 1 AND 10),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Time Tracking Logs
CREATE TABLE IF NOT EXISTS time_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  category text NOT NULL CHECK (category IN ('study', 'coding', 'entertainment', 'sleep', 'other')),
  hours decimal(4,2) NOT NULL,
  description text DEFAULT '',
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

-- Feedback Entries
CREATE TABLE IF NOT EXISTS feedback_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- User Daily Stats (aggregated metrics)
CREATE TABLE IF NOT EXISTS user_daily_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  date date NOT NULL DEFAULT CURRENT_DATE UNIQUE,
  total_focus_minutes integer DEFAULT 0,
  missions_completed integer DEFAULT 0,
  habits_completed integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE daily_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE non_negotiables ENABLE ROW LEVEL SECURITY;
ALTER TABLE deep_work_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_daily_stats ENABLE ROW LEVEL SECURITY;

-- Policies for daily_missions
CREATE POLICY "Users can view own missions"
  ON daily_missions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own missions"
  ON daily_missions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own missions"
  ON daily_missions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own missions"
  ON daily_missions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for non_negotiables
CREATE POLICY "Users can view own non-negotiables"
  ON non_negotiables FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own non-negotiables"
  ON non_negotiables FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own non-negotiables"
  ON non_negotiables FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policies for deep_work_sessions
CREATE POLICY "Users can view own deep work sessions"
  ON deep_work_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own deep work sessions"
  ON deep_work_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own deep work sessions"
  ON deep_work_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policies for daily_journals
CREATE POLICY "Users can view own journals"
  ON daily_journals FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own journals"
  ON daily_journals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own journals"
  ON daily_journals FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policies for time_logs
CREATE POLICY "Users can view own time logs"
  ON time_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own time logs"
  ON time_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own time logs"
  ON time_logs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for feedback_entries
CREATE POLICY "Users can view own feedback"
  ON feedback_entries FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own feedback"
  ON feedback_entries FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policies for user_daily_stats
CREATE POLICY "Users can view own stats"
  ON user_daily_stats FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stats"
  ON user_daily_stats FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stats"
  ON user_daily_stats FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_missions_user_date ON daily_missions(user_id, date);
CREATE INDEX IF NOT EXISTS idx_non_negotiables_user_date ON non_negotiables(user_id, date);
CREATE INDEX IF NOT EXISTS idx_deep_work_user_date ON deep_work_sessions(user_id, date);
CREATE INDEX IF NOT EXISTS idx_journals_user_date ON daily_journals(user_id, date);
CREATE INDEX IF NOT EXISTS idx_time_logs_user_date ON time_logs(user_id, date);
CREATE INDEX IF NOT EXISTS idx_stats_user_date ON user_daily_stats(user_id, date);