const express = require('express');
const router = express.Router();
const userCrtl = require('../controllers/user');
const auth = require('../middleware/auth');

router.post('/signup', userCrtl.signup);
router.post('/login',  userCrtl.login);

module.exports = router;