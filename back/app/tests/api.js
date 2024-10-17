const request = require('supertest');
const crypto = require('crypto');
const Redis = require('ioredis-mock');
const { rateLimit } = require("express-rate-limit");
const { RedisStore } = require("rate-limit-redis");

// Mock external dependencies
jest.mock('../logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

jest.mock('../db/setup', () => jest.fn());

jest.mock('pg', () => {
  const mPool = {
    connect: jest.fn().mockResolvedValue({
      query: jest.fn().mockResolvedValue({ rows: [{ now: new Date() }] }),
      release: jest.fn(),
    }),
    query: jest.fn().mockResolvedValue({ rows: [] }),
  };
  return { Pool: jest.fn(() => mPool) };
});

// Import the app after mocking dependencies
const app = require('../app');

describe('API Tests', () => {
  const generateHash = (login, password) => {
    return crypto.createHash('sha256').update(`${login}:${password}`).digest('hex');
  };

  const authHash = generateHash(process.env.API_LOGIN, process.env.API_PASSWORD);

  beforeAll(() => {
    // Setup mock Redis for rate limiting
    const redis = new Redis();
    app.use(rateLimit({
      store: new RedisStore({
        sendCommand: (...args) => redis.call(...args),
      }),
      windowMs: 15 * 60 * 1000,
      max: 5,
    }));
  });

  describe('Public Routes', () => {
    it('should return a welcome message', async () => {
      const res = await request(app).get('/');
      expect(res.statusCode).toBe(200);
      expect(res.text).toBe('🙌 Hello from Men dehqon!');
    });

    it('should test database connection', async () => {
      const res = await request(app).get('/db-test');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('success', true);
    });
  });

  describe('Authenticated Routes', () => {
    describe('User API', () => {
      it('should create a new user', async () => {
        const res = await request(app)
          .post('/api/users')
          .set('x-auth-hash', authHash)
          .send({
            telegram_id: '123456789',
            contact_number: '+1234567890',
            name: 'Test User'
          });
        expect(res.statusCode).toBe(201);
      });

      it('should get a user by telegram_id', async () => {
        const res = await request(app)
          .get('/api/users/telegram/123456789')
          .set('x-auth-hash', authHash);
        expect(res.statusCode).toBe(200);
      });

      it('should return 401 for unauthenticated request', async () => {
        const res = await request(app)
          .get('/api/users/telegram/123456789');
        expect(res.statusCode).toBe(401);
      });
    });

    describe('Listing API', () => {
      it('should create a new listing', async () => {
        const res = await request(app)
          .post('/api/listings')
          .set('x-auth-hash', authHash)
          .send({
            user_id: 1,
            name: 'Test Listing',
            location: 'Test Location',
            amount: 100,
            photo_urls: ['http://example.com/photo1.jpg'],
            price: 50,
            expiration_date: '2023-12-31'
          });
        expect(res.statusCode).toBe(201);
      });

      it('should get all valid listings', async () => {
        const res = await request(app)
          .get('/api/listings')
          .set('x-auth-hash', authHash);
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBeTruthy();
      });
    });
  });

  describe('Rate Limiting', () => {
    it('should limit requests after too many attempts', async () => {
      for (let i = 0; i < 6; i++) {
        const res = await request(app)
          .get('/api/users/telegram/123456789')
          .set('x-auth-hash', authHash);
        if (i === 5) {
          expect(res.statusCode).toBe(429);
        }
      }
    });
  });
});