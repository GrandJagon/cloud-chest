const { verifyAccessToken } = require('../services/tokens');
const User = require('../models/User.model');

// Middleware function to check if a user is authenticated before giving access to resources
const checkAuth = async (req, res, next) => {

    const token = req.header('auth-token');

    if (!token) return res.status(401).send('Access denied');

    try {
        // If token is valid user ID will be assigned to verifiedUser
        const verifiedUser = verifyAccessToken(token);

        console.log(verifiedUser);

        // Fetches user in db from id provided by token 
        const user = await User.findById({ _id: verifiedUser });
        if (!user) return res.status(401).send('User ID not matching the database');

        // User ID is stored in the request object before being passed to target route
        req.userId = verifiedUser;
        req.user = user;

        next();
    } catch (err) {
        return res.status(400).send(err.message);
    }
}

// Lightweight middleware for testing purpose only
// TO BE REPLACED WITH THE REAL ONE FOR PRODUCTION 
const checkAuthTest = async (req, res, next) => {
    const userId = req.header('userId');
    if (!userId) return res.status(401).send('User ID not provided');

    // Fetches user in db from id provided by token 
    const user = await User.findById({ _id: userId });
    if (!user) return res.status(401).send('User ID not matching the database');

    req.userId = userId;
    req.user = user;

    next();
}




module.exports = { checkAuth }