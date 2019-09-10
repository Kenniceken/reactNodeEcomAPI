const express = require('express');
const router = express.Router();

const {
	register,
	login, 
	logout, 
	requireLogin 
} = require('../controllers/auth');
const { userSignupValidator } = require('../validator');


router.post('/register', userSignupValidator, register);
router.post('/login', login);
router.get('/logout', logout);





module.exports = router;