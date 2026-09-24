const pool = require('../config/db');

const getTransportOptions = async (req, res) => {
  try {
    const { destinationId } = req.params;
    const { type, sort } = req.query;
    
    let query = 'SELECT * FROM transport_options WHERE destination_id = ?';
    const params = [destinationId];

    if (type) {
      query += ' AND transport_type = ?';
      params.push(type);
    }

    if (sort === 'price') {
      query += ' ORDER BY price ASC';
    } else if (sort === 'duration') {
      query += ' ORDER BY duration_minutes ASC';
    }

    const [options] = await pool.execute(query, params);
    res.json({ success: true, data: options });
  } catch (error) {
    console.error('getTransportOptions error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { getTransportOptions };
