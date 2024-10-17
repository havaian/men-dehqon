const express = require('express');
const { Pool } = require('pg');
const compression = require("compression");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const helmet = require('helmet');
const apiRateLimiter = require('./limiters/apiRateLimiter');
const authMiddleware = require('./middleware/auth');
const userRoutes = require('./routes/userRoutes');
const listingRoutes = require('./routes/listingRoutes');
const logger = require('./logger');
const db = require('./db/setup');

db();

function createApp() {
  const app = express();

  // Security headers
  app.use(helmet());

  app.use(compression());

  // Create a new pool using the connection string from environment variables
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  // Middleware to parse JSON bodies
  app.use(express.json());

  var corsOptions = {
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : "*",
    optionsSuccessStatus: 200
  };
  app.use(cors(corsOptions));

  app.use(cookieParser());

  app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }))

  // Rate limiter setup
  const apiLimiter = apiRateLimiter();

  // Logging middleware
  app.use((req, res, next) => {
    const originalSend = res.send;
    res.send = function (body) {
      res.locals.body = body;
      originalSend.call(this, body);
    };

    res.on('finish', () => {
      const logData = {
        method: req.method,
        url: req.url,
        status: res.statusCode,
        responseTime: res.get('X-Response-Time'),
        requestHeaders: { ...req.headers },
        requestBody: req.body,
        responseBody: res.locals.body,
      };

      // Exclude sensitive information
      delete logData.requestHeaders.authorization;
      delete logData.requestHeaders['x-auth-hash'];

      // Limit payload for 'all' requests
      if (req.url.includes('all')) {
        delete logData.requestBody;
        delete logData.responseBody;
      }

      logger.info('API Request', logData);
    });

    next();
  });

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
      logger.error('❌ Database connection error', { error: err.message });
      res.status(500).json({ state: "❌", success: false, error: 'Database connection error' });
    }
  });

  // Routes
  app.use('/api', apiLimiter, authMiddleware);
  app.use('/api/users', userRoutes);
  app.use('/api/listings', listingRoutes);

  // Error handling middleware
  app.use((err, req, res, next) => {
    logger.error('❌ Unhandled error', { error: err.message, stack: err.stack });
    res.status(500).json({ error: '❌ An unexpected error occurred' });
  });

  return app;
}

module.exports = { createApp };

// Only start the server if this file is run directly
// if (require.main === module) {
  const app = createApp();
  const port = process.env.BACK_PORT || 3000;
  app.listen(port, () => {
    logger.info(`✅ PORT: ${port}`);
  });
// }

// Bot integration (to be implemented later)
// require("./bot");