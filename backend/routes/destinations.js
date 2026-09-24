const express = require('express');
const router = express.Router();
const destinationController = require('../controllers/destinationController');

router.get('/', destinationController.getAllDestinations);
router.get('/:id', destinationController.getDestinationById);
router.get('/:id/attractions', destinationController.getAttractions);
router.get('/:id/foods', destinationController.getFoods);
router.get('/:id/restaurants', destinationController.getRestaurants);
router.get('/:id/souvenirs', destinationController.getSouvenirs);

module.exports = router;
