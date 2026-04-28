const { Pool } = require('pg');
require('dotenv').config();

const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      connectionTimeoutMillis: 2500,
      query_timeout: 2500,
      statement_timeout: 2500
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER || 'balowaci_user',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'balowaci_db',
      connectionTimeoutMillis: 2500,
      query_timeout: 2500,
      statement_timeout: 2500
    };

const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

module.exports = pool;
