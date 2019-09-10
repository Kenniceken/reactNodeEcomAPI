const express = require('express');
const router = express.Router();

const { requireLogin, isAuth, isAdmin } = require('../controllers/auth');

const { userById, read, update, orderHistory } = require('../controllers/user');

router.get('/secret/:userId', requireLogin, isAuth, (req, res) => {
	res.json({
		user: req.profile
	});
});

router.get('/user/:userId', requireLogin, isAuth, read);
router.put('/user/:userId', requireLogin, isAuth, update);
router.get('/orders/by/user/:userId', requireLogin, isAuth, orderHistory);


router.param('userId', userById);



module.exports = router;