const express =  require('express');
const router = express.Router();
const isAuth = require('../config/auth');

const { signup, login, getAllUsers } = require('../controller/user.controller');

router.post('/signup', signup);
router.post('/login', login);
router.get('/all-users', isAuth, getAllUsers);

module.exports = router;