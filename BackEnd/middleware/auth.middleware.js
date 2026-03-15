const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/auth');

exports.authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const [scheme, token] = authHeader ? authHeader.split(' ') : [];

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.user = user;
    return next();
  });
};
