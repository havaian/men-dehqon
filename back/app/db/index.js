const { Pool } = require('pg');
const logger = require('../logger');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

if (typeof pool.on === 'function') {
  pool.on('error', (err) => {
    logger.error('Unexpected error on idle client', err);
    process.exit(-1);
  });
}

module.exports = {
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.connect(),
};