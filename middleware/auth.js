const jwt = require('jsonwebtoken');
// const keys = require('../config/keys');
const JWT_SECRET="1F76961362D832146966AEEFE7C8CEB06BE3A9BEFD40B2707FBCEC32E436BB44"
module.exports = (req, res, next) => {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: 'Invalid Token' });
  }
};

// module.exports = authenticateUser;