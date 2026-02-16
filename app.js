const express = require('express');
const app = express();
const morgan = require('morgan');
const DB = require('./src/config/db');
require('dotenv').config();

const userRoutes = require('./src/routes/user.routes');
const productRoutes = require('./src/routes/product.routes');
const walletRoutes = require('./src/routes/wallet.routes');

const port = process.env.PORT


app.use(express.json());
app.use(morgan('dev'));


app.get('/', (req, res) => {
    res.send('Server is running properly');
});

const crypto = require("crypto");

// Routes
app.use('/users', userRoutes);
app.use('/products', productRoutes);
app.use('/wallet', walletRoutes);

app.listen(port, () => {
    DB()
    const secret = crypto.randomBytes(32).toString('hex');
    // console.log('JWT Secret:', secret);
    console.log(`Server is running on http://localhost:${port}`)
})