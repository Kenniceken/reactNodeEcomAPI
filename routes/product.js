const express = require('express');
const router = express.Router();

const {
    create,
    productById,
    read,
    listSearch,
    remove,
    update,
    list,
    relatedProducts,
    listProductsByCategories,
    productsBySearch,
    photo} = require('../controllers/product');
const { requireLogin, isAuth, isAdmin } = require('../controllers/auth');
const { userById } = require('../controllers/user');



router.get('/product/:productId', read);
router.get('/products/search', listSearch);
router.post('/product/create/:userId', requireLogin, isAuth, isAdmin, create);
router.delete('/product/:productId/:userId', requireLogin, isAuth, isAdmin, remove)
router.put('/product/:productId/:userId', requireLogin, isAuth, isAdmin, update)
router.get('/products', list);
router.get('/products/related/:productId', relatedProducts);
router.get('/products/categories', listProductsByCategories);
router.post('/products/by/search', productsBySearch);
router.get('/product/photo/:productId', photo);

router.param('userId', userById);
router.param('productId', productById);

module.exports = router;