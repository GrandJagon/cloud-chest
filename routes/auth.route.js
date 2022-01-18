const router = require('express').Router();
const { registerPost, loginPost, refreshTokenPost } = require('../controllers/auth.controller');
const { log } = require('../middlewares/log.middleware');

// To register post request
router.post('/register', log, registerPost);

// To login post request
router.post('/login', log, loginPost);

// To request a new access token
router.post('/refreshToken', log, refreshTokenPost);


module.exports = router;