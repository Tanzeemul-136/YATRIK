const pool = require('../config/db');

const addFavorite = async (req, res) => {
  try {
    const { item_type, item_id } = req.body;
    
    if (!item_type || !item_id) {
      return res.status(400).json({ success: false, message: 'item_type and item_id are required' });
    }

    // Ignore duplicate errors gracefully
    await pool.execute(
      'INSERT IGNORE INTO favorites (user_id, item_type, item_id, created_at) VALUES (?, ?, ?, NOW())',
      [req.user.id, item_type, item_id]
    );

    res.status(201).json({ success: true, message: 'Added to favorites' });
  } catch (error) {
    console.error('addFavorite error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const removeFavorite = async (req, res) => {
  try {
    const { id } = req.params; // favorite primary key or could be item_id + item_type
    
    await pool.execute('DELETE FROM favorites WHERE id = ? AND user_id = ?', [id, req.user.id]);
    
    res.json({ success: true, message: 'Removed from favorites' });
  } catch (error) {
    console.error('removeFavorite error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getUserFavorites = async (req, res) => {
  try {
    const [favorites] = await pool.execute('SELECT * FROM favorites WHERE user_id = ?', [req.user.id]);
    
    // Enrich with names
    for (let fav of favorites) {
      let tableName = '';
      if (fav.item_type === 'attraction') tableName = 'attractions';
      else if (fav.item_type === 'food') tableName = 'foods';
      else if (fav.item_type === 'restaurant') tableName = 'restaurants';
      else if (fav.item_type === 'destination') tableName = 'destinations';
      
      if (tableName) {
        const [items] = await pool.execute(`SELECT name FROM ${tableName} WHERE id = ?`, [fav.item_id]);
        if (items.length > 0) {
          fav.item_name = items[0].name;
        }
      }
    }

    // Group by item_type
    const grouped = favorites.reduce((acc, fav) => {
      if (!acc[fav.item_type]) acc[fav.item_type] = [];
      acc[fav.item_type].push(fav);
      return acc;
    }, {});

    res.json({ success: true, data: grouped });
  } catch (error) {
    console.error('getUserFavorites error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { addFavorite, removeFavorite, getUserFavorites };
