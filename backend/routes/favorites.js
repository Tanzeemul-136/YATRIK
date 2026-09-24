const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');
const auth = require('../middleware/auth');

router.use(auth);

router.post('/', favoriteController.addFavorite);
router.delete('/:id', favoriteController.removeFavorite);
router.get('/', favoriteController.getUserFavorites);

module.exports = router;
