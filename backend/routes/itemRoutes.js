const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { create, update, remove, like, comment } = require('../controllers/itemController');

router.post('/', authMiddleware, create);
router.patch('/:id', authMiddleware, update);
router.delete('/:id', authMiddleware, remove);
router.post('/:id/like', authMiddleware, like);
router.post('/:id/comment', authMiddleware, comment);

module.exports = router;
