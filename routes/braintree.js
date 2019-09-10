const express = require('express');
const router = express.Router();

const { requireLogin, isAuth } = require('../controllers/auth');
const { userById } = require('../controllers/user');
const { generateToken, processPayment } = require('../controllers/braintree');

router.get('/braintree/getToken/:userId', requireLogin, isAuth, generateToken);
router.post('/braintree/payment/:userId', requireLogin, isAuth, processPayment);


router.param('userId', userById)


module.exports = router;