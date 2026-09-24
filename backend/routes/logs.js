const express = require('express');
const router = express.Router();
const logController = require('../controllers/logController');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', logController.getLogs);
router.post('/', logController.addLog);

module.exports = router;
