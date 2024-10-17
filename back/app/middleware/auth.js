const crypto = require('crypto');

const generateHash = (login, password) => {
  return crypto.createHash('sha256').update(`${login}:${password}`).digest('hex');
};

const authMiddleware = (req, res, next) => {
  let isAuthenticated = false;

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
    return res.status(401).json({ error: "Unauthorized: Access denied." });
  }

  next();
};

module.exports = authMiddleware;