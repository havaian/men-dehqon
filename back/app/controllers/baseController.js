const pool = require('../db');

class BaseController {
  constructor() {
    this.pool = pool;
  }

  async executeQuery(query, params) {
    const client = await this.pool.connect();
    try {
      const result = await client.query(query, params);
      return result.rows;
    } catch (error) {
      throw new Error(`Database error: ${error.message}`);
    } finally {
      client.release();
    }
  }

  validateRequiredFields(data, fields) {
    for (const field of fields) {
      if (data[field] === undefined || data[field] === null) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
  }
}

module.exports = BaseController;