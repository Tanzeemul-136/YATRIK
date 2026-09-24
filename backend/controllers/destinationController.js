const pool = require('../config/db');

const getAllDestinations = async (req, res) => {
  try {
    const { search } = req.query;
    let query = 'SELECT * FROM destinations WHERE is_active = 1';
    const params = [];

    if (search) {
      query += ' AND name LIKE ?';
      params.push(`%${search}%`);
    }

    const [destinations] = await pool.execute(query, params);
    res.json({ success: true, data: destinations });
  } catch (error) {
    console.error('getAllDestinations error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getDestinationById = async (req, res) => {
  try {
    const { id } = req.params;
    const [destinations] = await pool.execute('SELECT * FROM destinations WHERE id = ?', [id]);
    
    if (destinations.length === 0) {
      return res.status(404).json({ success: false, message: 'Destination not found' });
    }

    const dest = destinations[0];
    
    // Fetch counts
    const [[{ count: attractionsCount }]] = await pool.execute('SELECT COUNT(*) as count FROM attractions WHERE destination_id = ?', [id]);
    const [[{ count: foodsCount }]] = await pool.execute('SELECT COUNT(*) as count FROM foods WHERE destination_id = ?', [id]);
    const [[{ count: restaurantsCount }]] = await pool.execute('SELECT COUNT(*) as count FROM restaurants WHERE destination_id = ?', [id]);
    const [[{ count: souvenirsCount }]] = await pool.execute('SELECT COUNT(*) as count FROM souvenirs WHERE destination_id = ?', [id]);

    const enrichedDestination = {
      ...dest,
      counts: {
        attractions: attractionsCount,
        foods: foodsCount,
        restaurants: restaurantsCount,
        souvenirs: souvenirsCount
      }
    };

    res.json({ success: true, data: enrichedDestination });
  } catch (error) {
    console.error('getDestinationById error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getAttractions = async (req, res) => {
  try {
    const { id } = req.params;
    const { category } = req.query;
    let query = 'SELECT * FROM attractions WHERE destination_id = ?';
    const params = [id];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    const [attractions] = await pool.execute(query, params);
    res.json({ success: true, data: attractions });
  } catch (error) {
    console.error('getAttractions error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getFoods = async (req, res) => {
  try {
    const { id } = req.params;
    const { dietary_type } = req.query;
    let query = 'SELECT * FROM foods WHERE destination_id = ?';
    const params = [id];

    if (dietary_type) {
      query += ' AND dietary_type = ?';
      params.push(dietary_type);
    }

    const [foods] = await pool.execute(query, params);
    res.json({ success: true, data: foods });
  } catch (error) {
    console.error('getFoods error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getRestaurants = async (req, res) => {
  try {
    const { id } = req.params;
    const { price_range } = req.query;
    let query = 'SELECT * FROM restaurants WHERE destination_id = ?';
    const params = [id];

    if (price_range) {
      query += ' AND price_range = ?';
      params.push(price_range);
    }

    const [restaurants] = await pool.execute(query, params);
    res.json({ success: true, data: restaurants });
  } catch (error) {
    console.error('getRestaurants error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getSouvenirs = async (req, res) => {
  try {
    const { id } = req.params;
    const [souvenirs] = await pool.execute('SELECT * FROM souvenirs WHERE destination_id = ?', [id]);
    res.json({ success: true, data: souvenirs });
  } catch (error) {
    console.error('getSouvenirs error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  getAllDestinations,
  getDestinationById,
  getAttractions,
  getFoods,
  getRestaurants,
  getSouvenirs
};
