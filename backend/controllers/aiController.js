const pool = require('../config/db');
const { generateAIPlan } = require('../services/aiService');
const { generateFallbackPlan } = require('../services/fallbackPlanner');

const planTrip = async (req, res) => {
  try {
    const tripData = req.body;
    const destId = tripData.destination_id;
    const destName = tripData.destination_name || tripData.destination;
    
    if (!destId && !destName) {
      return res.status(400).json({ success: false, message: 'Destination is required in trip data' });
    }

    // Fetch destination data - prefer ID lookup
    let dests;
    if (destId) {
      [dests] = await pool.execute('SELECT * FROM destinations WHERE id = ?', [destId]);
    } else {
      [dests] = await pool.execute('SELECT * FROM destinations WHERE name = ?', [destName]);
    }
    
    let destinationData = {
      destination_info: dests.length > 0 ? dests[0] : null,
      attractions: [],
      foods: [],
      restaurants: [],
      souvenirs: []
    };

    // Enrich trip data with destination name for the AI prompt
    if (dests.length > 0) {
      tripData.destination = dests[0].name;
      const fetchId = dests[0].id;
      const [attractions] = await pool.execute('SELECT * FROM attractions WHERE destination_id = ?', [fetchId]);
      const [foods] = await pool.execute('SELECT * FROM foods WHERE destination_id = ?', [fetchId]);
      const [restaurants] = await pool.execute('SELECT * FROM restaurants WHERE destination_id = ?', [fetchId]);
      const [souvenirs] = await pool.execute('SELECT * FROM souvenirs WHERE destination_id = ?', [fetchId]);
      
      destinationData.attractions = attractions;
      destinationData.foods = foods;
      destinationData.restaurants = restaurants;
      destinationData.souvenirs = souvenirs;
    }

    let plan;
    let mode = 'ai';
    
    try {
      plan = await generateAIPlan(tripData, destinationData);
    } catch (aiError) {
      console.warn('AI planning failed, falling back to rule-based planner:', aiError.message);
      mode = 'fallback';
      plan = generateFallbackPlan(tripData, destinationData);
    }

    if (req.user && req.user.id) {
      const loggedDest = tripData.destination || destName || 'Unknown';
      await pool.execute(
        'INSERT INTO system_logs (user_id, action, created_at) VALUES (?, ?, NOW())',
        [req.user.id, `Generated trip plan for ${loggedDest} via ${mode}`]
      ).catch(e => console.error('Log error:', e));
    }

    res.json({
      success: true,
      mode,
      plan,
      message: 'Plan generated successfully'
    });

  } catch (error) {
    console.error('planTrip error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { planTrip };