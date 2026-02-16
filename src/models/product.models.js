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
    new_price: {
        type: Number,
    },
    quantity: {
        type: Number,
        required: true
    },
    picture: {
        type: String,
        default: null,
    },
    uploaded_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true,
    versionKey: false
})

const Product = mongoose.model('Product', productSchema);

module.exports = Product;