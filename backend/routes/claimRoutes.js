const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { getAll, getOne, create, update, remove } = require('../controllers/claimController');

router.get('/', authMiddleware, getAll);
router.get('/:id', authMiddleware, getOne);
router.post('/', authMiddleware, create);
router.patch('/:id', authMiddleware, update);
router.delete('/:id', authMiddleware, remove);

module.exports = router;
