const express =  require('express');
const router = express.Router();
const isAuth = require('../config/auth');

const { signup, login, getAllUsers, updateprofile, editprofile, deleteprofile, deleteUser, verifyUser, verifyOtp } = require('../controller/user.controller');

router.post('/signup', signup);
router.post('/login', login);
router.get('/all-users', isAuth, getAllUsers);
router.patch('/edit-profile', isAuth, updateprofile );
router.patch('/edit-user-profile/:profileId', isAuth, editprofile );
router.delete('/delete-profile/:profileId', isAuth, deleteprofile );
router.delete('/delete-user', isAuth, deleteUser );
router.post('/verify-user', verifyUser );
router.put('/verify-otp', verifyOtp );

module.exports = router;