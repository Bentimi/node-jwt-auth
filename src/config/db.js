const mongoose = require('mongoose');
require('dotenv').config();

const DB_URI = process.env.DB_URI;

const DB = async () => {
    try {
        await mongoose.connect(DB_URI);
        console.log('Conneted to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB', error);
        process.exit(1);
    }
}

module.exports = DB;