const Product = require("../models/product.models");
const User = require("../models/user.models");
require('dotenv').config();


const allowedRoles = ['admin', 'staff'];

const addProduct = async (req, res) => {
    const { name, description, price, quantity, uploaded_by } = req.body;

    const { userId } = req.user;
    
    try {
        const adminuser = await User.findById(userId);
        if (!allowedRoles.includes(adminuser.role)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        if (!name || !description || !price || !quantity) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const exstingProduct = await Product.findOne({ name });
        if (exstingProduct) {
            return res.status(409).json({ message: "Product with this name already exists" });
        }

        const newProduct = new Product({
            name,
            description,
            price,
            quantity,
            uploaded_by: adminuser._id
        });

        await newProduct.save();

        return res.status(200).json({ message: 'Product added successfully', product: newProduct });
    } catch (e) {
        console.error('Error saving product', e);
        return  res.status(500).json({ message: "Internal server error" });
    }

}


const allProducts = async (req, res) => {

    const { userId } = req.user;

    try {
        const superuser = await User.findById(userId);
        if (!allowedRoles.includes(superuser.role)) {
            return res.status(403).json({ message: 'Access denied' });
        } 

        const products = await Product.find();

        return res.status(200).json({ products });

    } catch (e) {
        console.error('Error fetching products', e);
        return res.status(500).json({ message: "Internal server error" });
    }
    
}

const getProduct = async (req, res) => {

    const { userId } = req.user;
    const { productId } = req.params;

    try {
        const superuser = await User.findById(userId);
        if (!allowedRoles.includes(superuser.role)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        return res.status(200).json({ product });
    } catch (e) {
        console.error('Error fetching product', e);
        return res.status(500).json({ message: "Internal server error" });
    }
}

const editProduct = async (req, res) => {
    const { userId } = req.user
    const { productId } = req.params
    const { name, price, quantity, new_price, description, verified } = req.body;

    try {
        const userAuth = await User.findById(userId);
        
        if (!allowedRoles.includes(userAuth.role)) {
            return res.status(200).json({ message: "Access denied" });
        }
        
        if (userAuth.role === 'admin') {
            const updateproduct = await Product.findByIdAndUpdate(
             productId,
            { 
                name, price, quantity, new_price, description, verified
        });
        }

        const updateproduct = await Product.findByIdAndUpdate(
             productId,
            { 
                name, price, quantity, new_price, description
        });

        if (!updateproduct) {
            return res.status(400).json({ message: "No product found" });
        }

        return res.status(200).json(updateproduct)

    } catch (e) {
        console.error(e)
        return res.status(500).json({ message: "Internal server error" });
    }
}

const searchProduct = async (req, res) => {
    
    const { userId } = req.user;
    const { name } = req.query;
    
    try {
        const userAuth = await User.findById(userId);
        if (!allowedRoles.includes(userAuth.role)) {
            return res.status(400).json({ message: "Access Denied" });
        }

        const product = await Product.findOne({ name });
        if (!product) {
            return res.status(400).json({ message: "No product found" });
        }

        return res.status(200).json(product);
    } catch (e) {
        console.error(e)
        return res.status(500).json({ message: "Internal server error" });
    }
    
}

module.exports = { addProduct, allProducts, getProduct, editProduct, searchProduct }