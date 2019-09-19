const express = require('express');
const router = express.Router();

const {
	register,
	login, 
	logout, 
	requireLogin,
	forgotPassword,
	resetPassword
} = require('../controllers/auth');
const { userSignupValidator, passwordResetValidator } = require('../validator');


router.post('/register', userSignupValidator, register);
router.put('/forgot-password', forgotPassword);
router.put('/reset-password', passwordResetValidator, resetPassword);
router.post('/login', login);
router.get('/logout', logout);

module.exports = router;