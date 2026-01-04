const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    verified: {
        type: Boolean,
        default: false,
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    uploaded_by: {
        type: String,
    }
}, {
    timestamps: true,
    versionKey: false
})

const Product = mongoose.model('Product', productSchema);

module.exports = Product;