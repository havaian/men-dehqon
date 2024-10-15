const express = require('express');
const { Pool } = require('pg');

const app = express();
const port = process.env.BACK_PORT || 3000;

// Create a new pool using the connection string from environment variables
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Middleware to parse JSON bodies
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.send('🙌 Hello from Men dehqon!');
});

// Test database connection
app.get('/db-test', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    res.json({ state: "✅", success: true, time: result.rows[0].now });
  } catch (err) {
    console.error(err);
    res.status(500).json({ state: "❌", success: false, error: 'Database connection error' });
  }
});

app.listen(port, () => {
  console.log(`✅ PORT: ${port}`);
});

require("./bot");