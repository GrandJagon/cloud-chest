const router = require('express').Router();
const { registerPost, loginPost, refreshTokenPost } = require('../controllers/auth.controller');

// To register post request
router.post('/register', registerPost);

// To login post request
router.post('/login', loginPost);

// To request a new access token
router.post('/refreshToken', refreshTokenPost);


module.exports = router;