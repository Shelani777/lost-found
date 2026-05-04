const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');
const { getAll, create, update, remove } = require('../controllers/categoryController');

// Anyone logged in can view categories
router.get('/', authMiddleware, getAll);

// Only admin can create, edit, delete
router.post('/', adminMiddleware, create);
router.patch('/:id', adminMiddleware, update);
router.delete('/:id', adminMiddleware, remove);

module.exports = router;
