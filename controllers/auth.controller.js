require('dotenv').config({ path: '../.env' });
const User = require('../models/User.model');
const { loginValidation, registerValidation, refreshTokenValidation } = require('../validation');
const { compare } = require('../services/hasher');
const { TokenType, signedToken, verifyAccessToken, verifyRefreshToken } = require('../services/tokens');

const { salt, saltHash } = require('../services/hasher');
const Cache = require('../services/cache');


// Handles the post request to /auth/register
const registerPost = async (req, res) => {
    // Checking if body passes validation
    const { error } = registerValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    // Checking if email or username already assigned
    const emailExists = await User.findOne({ email: req.body.email });
    if (emailExists) return res.status(400).send(req.body.email + ': This email address is already in use');

    try {
        // Hashing the password with a salt of 32 random hexadecimal characters
        const hashedPassword = saltHash(req.body.password, salt(parseInt(process.env.SALT_LENGTH)));

        // Creating the user object and saving it in the database
        const user = new User({
            email: req.body.email,
            password: hashedPassword
        });

        await user.save();

        // Generating a signed token and sending it with the response
        const accessToken = await signedToken(user._id, TokenType.access);
        const refreshToken = await signedToken(user._id, TokenType.refresh);

        // Adding the refresh token to the cache
        await Cache.add(user._id.toString(), JSON.stringify(refreshToken));

        return res.status(200).json({ accessToken: accessToken, refreshToken: refreshToken, userId: user._id.toString() });

    } catch (err) {
        console.log(err.stack);
        res.status(500).send(err.message);
    }
};

// Handles the post request to /auth/login
const loginPost = async (req, res) => {
    // Validating request body
    const { error } = loginValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    // Checking if email exists in the db
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(401).send('Wrong email or password');

    // Comparing password hash with password database object (hash + salt)
    const isPasswordValid = compare(req.body.password, user.password)
    if (!isPasswordValid) return res.status(403).send('Wrong email or password');

    try {
        // Generating a signed token and sending it with the response
        const accessToken = await signedToken(user._id, TokenType.access);
        const refreshToken = await signedToken(user._id, TokenType.refresh);

        // Adding the refresh token to the cache
        await Cache.add(user._id.toString(), JSON.stringify(refreshToken));

        return res.status(200).json({ accessToken: accessToken, refreshToken: refreshToken, userId : user._id.toString() });
    } catch (err) {
        res.status(400).send(err.message);
    }

};

// Handles the request to ask for new access token, refresh token should be in body
const refreshTokenPost = async (req, res) => {
    // Validating request body
    const { error } = refreshTokenValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    var accessToken = req.body.accessToken;
    var refreshToken = req.body.refreshToken;

    try {
        // Verify tokens validity, each test return user ID if OK and then be passed to the next one 
        var userId = await verifyAccessToken(accessToken = accessToken, isRefreshRequested = true);
        userId = await verifyRefreshToken(refreshToken, userId);

        // Ensures that a token is present in the cache and compares it to the refresh token provided
        var cachedToken = await Cache.get(userId);

        if (cachedToken !== refreshToken) return res.status(400).send('Refresh token not matching');

        // Generates new access token and send it
        const newAccessToken = await signedToken(userId, TokenType.access);

        res.status(200).json({ accessToken: newAccessToken });
    } catch (error) {
        consle.log(error);
        res.status(500).send(error.message);
    }
};


module.exports = { registerPost, loginPost, refreshTokenPost };