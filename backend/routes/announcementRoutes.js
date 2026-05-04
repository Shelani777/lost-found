const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { create, update, remove } = require('../controllers/announcementController');

router.post('/', authMiddleware, create);
router.patch('/:id', authMiddleware, update);
router.delete('/:id', authMiddleware, remove);

module.exports = router;
