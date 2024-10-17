const logger = require('../logger');

const errorHandler = (res, error) => {
  logger.error('Error:', error);
  res.status(error.status || 500).json({ 
    error: error.message || 'An unexpected error occurred'
  });
};

module.exports = errorHandler;