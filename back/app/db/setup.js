const fs = require('fs');
const path = require('path');
const db = require('./index');
const logger = require('../logger');

async function setupDatabase() {
  const client = await db.getClient();
  try {
    const sqlScript = fs.readFileSync(path.join(__dirname, 'setup.sql'), 'utf8');
    await client.query(sqlScript);
    logger.info('✅ Database setup');
  } catch (err) {
    logger.error('❌ Error setting up database:', { error: err.message, stack: err.stack });
    throw err; // Rethrow the error to be handled by the caller
  } finally {
    client.release();
  }
}

module.exports = setupDatabase;