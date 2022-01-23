require('dotenv').config();
const https = require('https');
const fs = require('fs');
const express = require('express');
const helmet = require('helmet');
const {log} = require('./middlewares/log.middleware');

const app = express();

// Loading SSL certficate 
const options = {
    key: fs.readFileSync('./ssl/server.key'),
    cert: fs.readFileSync('./ssl/server.cert')
};


// Importing and initiating mongoDB and redis cache (used to store fresh tokens)
require('./services/database');
require('./services/cache');

// Importing routes
const authRoute = require('./routes/auth.route');
const albumsRoute = require('./routes/albums.route');
const contentRoute = require('./routes/content.route');
const userRoute = require('./routes/users.route');

// Attaching Middlewares
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/storage', express.static('storage'));


// Attaching routes
app.use('/', log);
app.use('/auth', authRoute);
app.use('/albums', albumsRoute);
app.use('/content', contentRoute);
app.use('/users', userRoute);


var httpsServer = https.createServer(options, app);

// Starting listening to port provided 
httpsServer.listen(process.env.PORT, ()=>{
    console.log('Server up and listening to port '+process.env.PORT);
});






