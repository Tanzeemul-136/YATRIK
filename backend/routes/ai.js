const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const auth = require('../middleware/auth');

// Make it optional or require auth based on needs. We'll add auth.
router.post('/plan', auth, aiController.planTrip);

module.exports = router;
