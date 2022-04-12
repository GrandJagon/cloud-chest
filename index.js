require('dotenv').config();
const https = require('https');
const fs = require('fs');
const express = require('express');
const helmet = require('helmet');
const process = require('process');
const {log} = require('./middlewares/log.middleware');
const  { enableSignup, disableSignup } = require('./controllers/auth.controller');

// Assigning name to process in order to retrieve it in case use from ssh
process.title = 'cloud-chest';

const app = express();

// Loading SSL certficate 
const options = {
    key: fs.readFileSync('./ssl/server.key'),
    cert: fs.readFileSync('./ssl/server.cert')
};


// Importing and initiating mongoDB and redis cache (used to store fresh tokens)
require('./services/database');
require('./services/cache');
require('./services/config');
require('./services/mailer');


// Importing routes
const authRoute = require('./routes/auth.route');
const albumsRoute = require('./routes/albums.route');
const singleAlbumRoute = require('./routes/singleAlbum.route');
const userRoute = require('./routes/users.route');
const storageRoute = require('./routes/storage.route');

// Attaching Middlewares
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Attaching routes
app.use('/', log);
app.use('/auth', authRoute);
app.use('/albums', albumsRoute);
app.use('/singleAlbum', singleAlbumRoute);
app.use('/users', userRoute);

// Static file serving
app.use('/storage', storageRoute);
app.use('/storage', express.static('storage'));

var httpsServer = https.createServer(options, app);

// Starting listening to port provided 
httpsServer.listen(process.env.PORT, ()=>{
    console.log('Server up and listening to port '+process.env.PORT);
    console.log('Process ID is '+ process.pid);
    console.log('Process name is '+ process.title);
});

    
// Basic console to enter command
var readline = require('readline');

var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});


// Listening for lines, expected input are commands
rl.on('line', (line) => {
    if(line == 'exit') process.exit();
    if(line == 'signup-enable') enableSignup();
    if(line == 'signup-disable') disableSignup();
    if(line == 'signup-state') console.log(serverConfig.getValue('enableSignup'))
});










