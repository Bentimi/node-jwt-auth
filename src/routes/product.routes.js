const express =  require('express');
const router = express.Router();
const isAuth = require('../config/auth');

const { addProduct, allProducts, getProduct, editProduct, searchProduct, deleteProduct } = require('../controller/product.controller');


router.post('/add-product', isAuth, addProduct);
router.get('/all-products', isAuth, allProducts);
router.get('/get-product/:productId', isAuth, getProduct);
router.put('/edit-product/:productId', isAuth, editProduct);
router.get('/search-product', isAuth, searchProduct);
router.delete('/delete-product/:productId', isAuth, deleteProduct);


module.exports = router;