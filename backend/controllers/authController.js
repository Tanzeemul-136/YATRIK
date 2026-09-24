const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const logAction = async (userId, action) => {
  try {
    await pool.execute(
      'INSERT INTO system_logs (user_id, action, created_at) VALUES (?, ?, NOW())',
      [userId, action]
    );
  } catch (err) {
    console.error('Failed to log action:', err);
  }
};

const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }

    const [existing] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = 'YT-' + Math.floor(1000 + Math.random() * 9000);

    const [result] = await pool.execute(
      'INSERT INTO users (user_id, name, email, password_hash, created_at) VALUES (?, ?, ?, ?, NOW())',
      [userId, name, email, hashedPassword]
    );

    await logAction(result.insertId, 'User registered');

    res.status(201).json({
      success: true,
      data: { user_id: userId, name, email }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const [users] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = Buffer.from(user.user_id).toString('base64');
    
    await logAction(user.id, 'Login successful');

    const userData = { ...user };
    delete userData.password_hash;

    res.json({
      success: true,
      data: { user: userData, token }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const logout = async (req, res) => {
  try {
    await logAction(req.user.id, 'Logout');
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getProfile = async (req, res) => {
  try {
    const userData = { ...req.user };
    delete userData.password_hash;
    res.json({ success: true, data: userData });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { signup, login, logout, getProfile };
