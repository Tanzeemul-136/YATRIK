const pool = require('../config/db');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authentication required. Please provide a Bearer token.' });
    }

    const token = authHeader.replace('Bearer ', '');
    const userId = Buffer.from(token, 'base64').toString('ascii');

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Invalid token format' });
    }

    const [users] = await pool.execute('SELECT * FROM users WHERE user_id = ?', [userId]);
    
    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid token or user does not exist' });
    }

    req.user = users[0];
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ success: false, message: 'Authentication failed' });
  }
};

module.exports = auth;
