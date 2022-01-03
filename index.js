require('dotenv').config();
const express = require('express');
const helmet = require('helmet');

const app = express();


// Importing and initiating mongoDB and redis cache (used to store fresh tokens)
require('./services/database');
require('./services/cache');

// Importing routes
const authRoute = require('./routes/auth.route');
const albumsRoute = require('./routes/albums.route');
const contentRoute = require('./routes/content.route');
const userRoute = require('./routes/users.route');

// Attaching Middlewares
app.use(helmet);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/storage', express.static('storage'));


// Attaching routes
app.use('/auth', authRoute);
app.use('/albums', albumsRoute);
app.use('/content', contentRoute);
app.use('/users', userRoute);


// Starting to listen to port 3000 on local host
app.listen(process.env.PORT, () => {
    console.log('Listening to port ' + process.env.PORT);
});





