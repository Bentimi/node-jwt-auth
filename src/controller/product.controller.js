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

module.exports = { addProduct, allProducts }