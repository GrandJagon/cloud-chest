const requestIp = require('request-ip');

// Middleware to log incoming request for testing purpose
const log = (req, res, next) => {
    var ip = requestIp.getClientIp(req);
    var url = req.protocol + '://' + req.get('host') + req.originalUrl;

    console.log(Date(Date.now())+ ' => ' + ip + ' made a request to ' + url);

    next();
}

module.exports = { log };