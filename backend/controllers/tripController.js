const pool = require('../config/db');

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

const createTrip = async (req, res) => {
  try {
    const { destination_id, start_date, end_date, travelers, budget } = req.body;
    
    if (!destination_id || !start_date || !end_date || !travelers || !budget) {
      return res.status(400).json({ success: false, message: 'Missing required trip fields' });
    }

    const [result] = await pool.execute(
      'INSERT INTO trips (user_id, destination_id, start_date, end_date, travelers, budget, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
      [req.user.id, destination_id, start_date, end_date, travelers, budget]
    );

    const tripId = result.insertId;
    
    await logAction(req.user.id, 'Trip created');

    const [trips] = await pool.execute('SELECT * FROM trips WHERE id = ?', [tripId]);

    res.status(201).json({ success: true, data: trips[0] });
  } catch (error) {
    console.error('createTrip error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getUserTrips = async (req, res) => {
  try {
    const query = `
      SELECT t.*, d.name as destination_name 
      FROM trips t 
      JOIN destinations d ON t.destination_id = d.id 
      WHERE t.user_id = ?
      ORDER BY t.created_at DESC
    `;
    const [trips] = await pool.execute(query, [req.user.id]);
    res.json({ success: true, data: trips });
  } catch (error) {
    console.error('getUserTrips error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getTripById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [trips] = await pool.execute(`
      SELECT t.*, d.name as destination_name, d.description as destination_desc
      FROM trips t 
      JOIN destinations d ON t.destination_id = d.id 
      WHERE t.id = ? AND t.user_id = ?
    `, [id, req.user.id]);

    if (trips.length === 0) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    const trip = trips[0];

    const [itineraryItems] = await pool.execute(`
      SELECT i.*, a.name as attraction_name, f.name as food_name, r.name as restaurant_name
      FROM itinerary_items i
      LEFT JOIN attractions a ON i.attraction_id = a.id
      LEFT JOIN foods f ON i.food_id = f.id
      LEFT JOIN restaurants r ON i.restaurant_id = r.id
      WHERE i.trip_id = ?
      ORDER BY i.day_number ASC, FIELD(i.time_slot, 'Morning', 'Afternoon', 'Evening', 'Night')
    `, [id]);

    trip.itinerary = itineraryItems;

    res.json({ success: true, data: trip });
  } catch (error) {
    console.error('getTripById error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const saveTripItinerary = async (req, res) => {
  try {
    const { id } = req.params;
    const { items } = req.body; 

    // check trip ownership
    const [trips] = await pool.execute('SELECT id FROM trips WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (trips.length === 0) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    if (!Array.isArray(items)) {
      return res.status(400).json({ success: false, message: 'Items should be an array' });
    }

    for (let item of items) {
      await pool.execute(
        'INSERT INTO itinerary_items (trip_id, day_number, time_slot, activity_type, attraction_id, food_id, restaurant_id, estimated_cost, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [id, item.day_number, item.time_slot, item.activity_type || null, item.attraction_id || null, item.food_id || null, item.restaurant_id || null, item.estimated_cost || 0, item.notes || '']
      );
    }

    res.json({ success: true, message: 'Itinerary saved successfully' });
  } catch (error) {
    console.error('saveTripItinerary error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { createTrip, getUserTrips, getTripById, saveTripItinerary };
