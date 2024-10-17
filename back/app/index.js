const express = require('express');
const { Pool } = require('pg');
const userRoutes = require('./routes/userRoutes');
const listingRoutes = require('./routes/listingRoutes');
const compression = require("compression");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const crypto = require('crypto');
const { rateLimit } = require("express-rate-limit");
const { RedisStore } = require("rate-limit-redis");
const Redis = require("ioredis");
const helmet = require('helmet');
const logger = require('./logger');
const db = require('./db/setup');

db();

const app = express();
const port = process.env.BACK_PORT || 3000;

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

app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Redis setup for rate limiting
const redis = new Redis(process.env.REDIS_URL);

// Rate limiter setup
const authLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redis.call(...args),
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: "Too many authentication attempts, please try again later.",
  keyGenerator: (req) => req.ip,
});

// Authentication and logging middleware
app.use((req, res, next) => {
  if (req.path === '/' || req.path === '/db-test') {
    return next();
  }

  let isAuthenticated = false;

  const generateHash = (login, password) => {
    return crypto.createHash('sha256').update(`${login}:${password}`).digest('hex');
  };

  const authHash = req.headers['x-auth-hash'];
  const expectedHash = generateHash(process.env.API_LOGIN, process.env.API_PASSWORD);

  if (authHash === expectedHash) {
    isAuthenticated = true;
  } else {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
      const user = auth[0];
      const pass = auth[1];

      if (user === process.env.API_LOGIN && pass === process.env.API_PASSWORD) {
        isAuthenticated = true;
      }
    }
  }

  if (!isAuthenticated) {
    return authLimiter(req, res, () => {
      res.status(401).json({ error: "Unauthorized: Access denied." });
    });
  }

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
app.use('/api/users', userRoutes);
app.use('/api/listings', listingRoutes);

app.listen(port, () => {
  logger.info(`✅ PORT: ${port}`);
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  res.status(500).json({ error: 'An unexpected error occurred' });
});

// Bot integration (to be implemented later)
// require("./bot");