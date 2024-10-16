const pool = require('../db');

exports.createListing = async (listingData) => {
  const { user_id, name, location, amount, photo_urls, price, expiration_date } = listingData;
  const result = await pool.query(
    'INSERT INTO listings (user_id, name, location, amount, photo_urls, price, expiration_date) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
    [user_id, name, location, amount, photo_urls, price, expiration_date]
  );
  return result.rows[0];
};

exports.getAllListings = async () => {
  const threeDbys = new Date();
  threeDbys.setDate(threeDbys.getDate() + 3);
  
  const result = await pool.query(
    'SELECT * FROM listings WHERE expiration_date >= CURRENT_DATE AND expiration_date <= $1 ORDER BY expiration_date ASC',
    [threeDbys]
  );
  return result.rows;
};

exports.getListing = async (id) => {
  const result = await pool.query('SELECT * FROM listings WHERE id = $1', [id]);
  return result.rows[0];
};

exports.updateListing = async (id, listingData) => {
  const { user_id, name, location, amount, photo_urls, price, expiration_date } = listingData;
  const result = await pool.query(
    'UPDATE listings SET user_id = $1, name = $2, location = $3, amount = $4, photo_urls = $5, price = $6, expiration_date = $7 WHERE id = $8 RETURNING *',
    [user_id, name, location, amount, photo_urls, price, expiration_date, id]
  );
  return result.rows[0];
};

exports.deleteListing = async (id) => {
  const result = await pool.query('DELETE FROM listings WHERE id = $1 RETURNING *', [id]);
  return result.rows[0];
};
