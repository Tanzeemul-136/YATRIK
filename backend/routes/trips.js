const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');
const auth = require('../middleware/auth');

router.use(auth); // Apply auth middleware to all trip routes

router.post('/', tripController.createTrip);
router.get('/', tripController.getUserTrips);
router.get('/:id', tripController.getTripById);
router.post('/:id/itinerary', tripController.saveTripItinerary);

module.exports = router;
