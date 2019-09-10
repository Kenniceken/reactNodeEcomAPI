const express = require('express');
const router = express.Router();

const { requireLogin, isAuth, isAdmin } = require('../controllers/auth');
const { userById, addOrderToUserOrderHistory } = require('../controllers/user');
const { create, listOrders, getOrderStatusValues, orderById, updateOrderStatus } = require('../controllers/order');
const { decreaseProductQuantity } = require('../controllers/product');


router.post(
    '/order/create/:userId',
    requireLogin,
    isAuth,
    addOrderToUserOrderHistory,
    decreaseProductQuantity,
    create
);

router.get('/order/list/:userId', requireLogin, isAuth, isAdmin, listOrders);
router.get('/order/status-values/:userId', requireLogin, isAuth, isAdmin, getOrderStatusValues);
router.put('/order/:orderId/status/:userId', requireLogin, isAuth, isAdmin, updateOrderStatus);



router.param('userId', userById);
router.param("orderId", orderById);


module.exports = router;