const pool = require('./connection');

async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS feedback (
      id SERIAL PRIMARY KEY,
      visitor_name TEXT,
      visitor_email TEXT,
      visitor_phone TEXT,
      first_impression TEXT NOT NULL,
      unique_experience TEXT NOT NULL,
      interest TEXT NOT NULL,
      journey_thoughts TEXT,
      target_customer TEXT,
      problem_solved TEXT,
      willingness_to_pay TEXT,
      watch_value_estimate TEXT,
      adoption_barriers TEXT,
      must_have_features TEXT,
      pilot_interest TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    ALTER TABLE feedback ADD COLUMN IF NOT EXISTS visitor_name TEXT;
    ALTER TABLE feedback ADD COLUMN IF NOT EXISTS visitor_email TEXT;
    ALTER TABLE feedback ADD COLUMN IF NOT EXISTS visitor_phone TEXT;
    ALTER TABLE feedback ADD COLUMN IF NOT EXISTS target_customer TEXT;
    ALTER TABLE feedback ADD COLUMN IF NOT EXISTS problem_solved TEXT;
    ALTER TABLE feedback ADD COLUMN IF NOT EXISTS willingness_to_pay TEXT;
    ALTER TABLE feedback ADD COLUMN IF NOT EXISTS watch_value_estimate TEXT;
    ALTER TABLE feedback ADD COLUMN IF NOT EXISTS adoption_barriers TEXT;
    ALTER TABLE feedback ADD COLUMN IF NOT EXISTS must_have_features TEXT;
    ALTER TABLE feedback ADD COLUMN IF NOT EXISTS pilot_interest TEXT;

    CREATE TABLE IF NOT EXISTS interpretations (
      id SERIAL PRIMARY KEY,
      mode VARCHAR(50) NOT NULL,
      label VARCHAR(100),
      value TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS admin_users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'viewer',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_interpretations_created_at ON interpretations(created_at DESC);
  `);
}

module.exports = initializeDatabase;
