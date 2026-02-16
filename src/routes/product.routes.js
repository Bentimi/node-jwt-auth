const express =  require('express');
const router = express.Router();
const isAuth = require('../config/auth');

const { addProduct, allProducts, getProduct, editProduct, searchProduct, deleteProduct, uploadProductPicture } = require('../controller/product.controller');
const upload = require('../config/multer');


router.post('/add-product', isAuth, addProduct);
router.get('/all-products', isAuth, allProducts);
router.get('/get-product/:productId', isAuth, getProduct);
router.patch('/edit-product/:productId', isAuth, editProduct);
router.get('/search-product', isAuth, searchProduct);
router.delete('/delete-product/:productId', isAuth, deleteProduct);
router.put('/upload-product-picture/:productId', isAuth, upload.single('productPicture'), uploadProductPicture);


module.exports = router;