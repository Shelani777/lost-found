const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { bootstrap } = require('../controllers/bootstrapController');

router.get('/', authMiddleware, bootstrap);

module.exports = router;
