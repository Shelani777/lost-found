const express = require('express');
const router = express.Router();
const adminMiddleware = require('../middleware/admin');
const { create, update, remove } = require('../controllers/announcementController');

router.post('/', adminMiddleware, create);
router.patch('/:id', adminMiddleware, update);
router.delete('/:id', adminMiddleware, remove);

module.exports = router;
