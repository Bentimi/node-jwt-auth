const express = require('express');
const app = express();
const morgan = require('morgan');
const DB = require('./src/config/db');
require('dotenv').config();

const userRoutes = require('./src/routes/user.routes');
const productRoutes = require('./src/routes/product.routes');

const port = process.env.PORT


app.use(express.json());
app.use(morgan('dev'));


app.get('/', (req, res) => {
    res.send('Server is running properly');
});

// Routes
app.use('/users', userRoutes);
app.use('/products', productRoutes);

app.listen(port, () => {
    DB()
    console.log(`Server is running on http://localhost:${port}`)
})