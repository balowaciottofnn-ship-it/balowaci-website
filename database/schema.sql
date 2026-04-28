-- BaloWaci Database Schema

-- Create feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id SERIAL PRIMARY KEY,
  first_impression TEXT NOT NULL,
  unique_experience TEXT NOT NULL,
  interest TEXT NOT NULL,
  journey_thoughts TEXT,
  target_customer TEXT,
  problem_solved TEXT,
  willingness_to_pay TEXT,
  adoption_barriers TEXT,
  must_have_features TEXT,
  pilot_interest TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Keep existing local databases compatible when this schema is re-run
ALTER TABLE feedback ADD COLUMN IF NOT EXISTS target_customer TEXT;
ALTER TABLE feedback ADD COLUMN IF NOT EXISTS problem_solved TEXT;
ALTER TABLE feedback ADD COLUMN IF NOT EXISTS willingness_to_pay TEXT;
ALTER TABLE feedback ADD COLUMN IF NOT EXISTS adoption_barriers TEXT;
ALTER TABLE feedback ADD COLUMN IF NOT EXISTS must_have_features TEXT;
ALTER TABLE feedback ADD COLUMN IF NOT EXISTS pilot_interest TEXT;

-- Create interpretations table (for logging/history)
CREATE TABLE IF NOT EXISTS interpretations (
  id SERIAL PRIMARY KEY,
  mode VARCHAR(50) NOT NULL,
  label VARCHAR(100),
  value TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create admin users table (optional)
CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'viewer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_feedback_created_at ON feedback(created_at DESC);
CREATE INDEX idx_interpretations_created_at ON interpretations(created_at DESC);

-- Sample trigger to update updated_at automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_feedback_updated_at
  BEFORE UPDATE ON feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
