const pool = require('../config/db');

const getLogs = async (req, res) => {
  try {
    const [logs] = await pool.execute(
      'SELECT * FROM system_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
      [req.user.id]
    );
    res.json({ success: true, data: logs });
  } catch (error) {
    console.error('getLogs error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const addLog = async (req, res) => {
  try {
    const { action, details } = req.body;
    
    if (!action) {
      return res.status(400).json({ success: false, message: 'action is required' });
    }

    await pool.execute(
      'INSERT INTO system_logs (user_id, action, details, created_at) VALUES (?, ?, ?, NOW())',
      [req.user.id, action, details || null]
    );
    
    res.status(201).json({ success: true, message: 'Log added' });
  } catch (error) {
    console.error('addLog error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { getLogs, addLog };
