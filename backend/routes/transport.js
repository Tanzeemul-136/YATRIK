const express = require('express');
const router = express.Router();
const transportController = require('../controllers/transportController');

router.get('/:destinationId', transportController.getTransportOptions);

module.exports = router;
