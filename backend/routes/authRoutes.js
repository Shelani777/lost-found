const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { register, login, getMe, updateMe } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.get('/me', authMiddleware, getMe);
router.patch('/me', authMiddleware, updateMe);

module.exports = router;
