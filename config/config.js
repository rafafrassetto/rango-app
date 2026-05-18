require('dotenv').config();

const url = process.env.DATABASE_URL || '';
const isSupabase = /supabase\.(co|com|net)/.test(url) || process.env.DB_SSL === 'true';

const base = {
  use_env_variable: 'DATABASE_URL',
  dialect: 'postgres',
  logging: false,
  pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
  ...(isSupabase && {
    dialectOptions: {
      ssl: { require: true, rejectUnauthorized: false },
    },
  }),
};

module.exports = {
  development: base,
  test: base,
  production: base,
};
