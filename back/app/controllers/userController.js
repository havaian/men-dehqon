const pool = require('../db');

exports.createUser = async (userData) => {
  const { telegram_id, contact_number, name } = userData;
  const result = await pool.query(
    'INSERT INTO users (telegram_id, contact_number, name) VALUES ($1, $2, $3) RETURNING *',
    [telegram_id, contact_number, name]
  );
  return result.rows[0];
};

exports.getUser = async (id) => {
  const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0];
};

exports.getUserByTelegramId = async (telegramId) => {
  const result = await pool.query('SELECT * FROM users WHERE telegram_id = $1', [telegramId]);
  return result.rows[0];
};

exports.updateUser = async (id, userData) => {
  const { telegram_id, contact_number, name } = userData;
  const result = await pool.query(
    'UPDATE users SET telegram_id = $1, contact_number = $2, name = $3 WHERE id = $4 RETURNING *',
    [telegram_id, contact_number, name, id]
  );
  return result.rows[0];
};

exports.deleteUser = async (id) => {
  const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
  return result.rows[0];
};