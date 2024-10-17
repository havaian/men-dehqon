const request = require('supertest');
const crypto = require('crypto');
const mockCreateDb = require('./db.mock');

// Mock external dependencies
jest.mock('../logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

jest.mock('../db/setup', () => jest.fn());

// Mock pg module
jest.mock('pg', () => {
  const dbMock = mockCreateDb();
  return { Pool: jest.fn(() => dbMock.poolMock) };
});

jest.mock('../limiters/apiRateLimiter', () => {
  return jest.fn().mockImplementation(() => {
    return (req, res, next) => next();
  });
});

const { createApp } = require('../index');

describe('API Tests', () => {
  let app;
  let dbMock;

  beforeEach(() => {
    dbMock = mockCreateDb();
    app = createApp();
  });

  const generateHash = (login, password) => {
    return crypto.createHash('sha256').update(`${login}:${password}`).digest('hex');
  };

  const authHash = generateHash(process.env.API_LOGIN, process.env.API_PASSWORD);

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
        expect(res.body).toHaveProperty('id');
        expect(res.body.telegram_id).toBe('123456789');
      });

      it('should get a user by telegram_id', async () => {
        await request(app)
          .post('/api/users')
          .set('x-auth-hash', authHash)
          .send({
            telegram_id: '123456789',
            contact_number: '+1234567890',
            name: 'Test User'
          });

        const res = await request(app)
          .get('/api/users/telegram/123456789')
          .set('x-auth-hash', authHash);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('telegram_id', '123456789');
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
        expect(res.body).toHaveProperty('id');
        expect(res.body.name).toBe('Test Listing');
      });

      it('should get all valid listings', async () => {
        await request(app)
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

        const res = await request(app)
          .get('/api/listings')
          .set('x-auth-hash', authHash);
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBeTruthy();
        expect(res.body.length).toBeGreaterThan(0);
      });
    });
  });
});