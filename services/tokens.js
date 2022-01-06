require("dotenv").config();
const crypto = require('crypto');
const uuid = require('uuid');

// Enum that will allow to choose between access token and refresh token in the function arguments
// Some functions to generate of verify tokens take it as arguments as most of the steps are similar for both tokens
const TokenType = Object.freeze({ 'access': 0, 'refresh': 1 });

// Custom error to throw when token is non valid
class TokenError extends Error {
    constructor(message) {
        super(message);
        this.name = "Token error";
        this.message = message;
    }
}

// Converts a string to base 64 URL, necessary for encoding header and payload
const _toBase64Url = (data) => {

    // Encoding data to regular base 64 string
    var encodedData = Buffer.from(data).toString('base64');

    // Removing = at the end of string
    encodedData = encodedData.replace(/=+$/, '')

    // Replacing + and / by - and _
    encodedData = encodedData.replace(/\+/g, '-');
    encodedData = encodedData.replace(/\//g, '_');

    return encodedData;
}

// Decodes a base 64 url string 
const _decodeBase64Url = (data) => {

    data = data.replace(/-/g, '+');
    data = data.replace(/_/g, '/');

    var decodedData = Buffer.from(data, 'base64').toString();

    return decodedData;
}

// Generates a JSON Web Token
// isRefresh = true if the token is a refresh token and false if access token
const _generateToken = (userId, tokenType) => {

    const header = {
        'alg': 'HS256',
        'typ': 'JWT'
    };

    var payload;

    if (tokenType == TokenType.refresh) {
        // Generates a unique ID for this particular token
        const uniqueId = uuid.v1();

        payload = {
            'sub': userId,
            'iss': process.env.TOKEN_ISSUER,
            'id': uniqueId,
            'iat': Date.now(),
            'exp': Date.now() + (process.env.REFRESH_TOKEN_EXPIRATION * 1000)
        };

    } else {

        payload = {
            "iss": process.env.TOKEN_ISSUER,
            "iat": Date.now(),
            "exp": Date.now() + (process.env.ACCESS_TOKEN_EXPIRATION * 1000),
            "sub": userId
        };
    }

    // Encode header to base 64 url format
    var stringifiedHeader = JSON.stringify(header);
    var encodedHeader = _toBase64Url(stringifiedHeader);

    // Encode payload to base 64 url format
    var stringifiedPayload = JSON.stringify(payload);
    var encodedPayload = _toBase64Url(stringifiedPayload);

    var token = encodedHeader + "." + encodedPayload;

    return token;
}

// Generate a signed token, takes tokenType as argument => see enum top of the page
const signedToken = (userId, tokenType) => {
    // Get the secret corresponding to the type in argument
    var secret;
    if (tokenType == TokenType.access) secret = process.env.ACCESS_TOKEN_SECRET;
    if (tokenType == TokenType.refresh) secret = process.env.REFRESH_TOKEN_SECRET;

    // Generate an unsigned token with user ID as public claim
    var token = _generateToken(userId, tokenType);

    // Generate a signature from unsigned token using hmac algorithm
    var signature = crypto.Hmac('sha256', secret).update(token).digest('string');

    signature = _toBase64Url(signature);

    // Signing the token
    var signedToken = token + "." + signature;

    return signedToken;
}

// Verify a token structure and that the signature is valid, used for both access and refresh tokens
// Takes token as argument and returns decoded body + payload in a json object
const _verifyIntegrity = (token, tokenType) => {

    // Get the secret corresponding to the type in argument
    var secret;
    if (tokenType == TokenType.access) secret = process.env.ACCESS_TOKEN_SECRET;
    if (tokenType == TokenType.refresh) secret = process.env.REFRESH_TOKEN_SECRET;

    if (typeof token != 'string') throw new TokenError('Token must be of string type');

    var splittedToken = token.split('.');

    if (splittedToken.length !== 3) throw new TokenError('Token malformed');

    var header = splittedToken[0];
    var payload = splittedToken[1];
    var signature = splittedToken[2];

    // Decode header and payload to check if it is proper base64URL
    try {
        var decodedHeader = _decodeBase64Url(splittedToken[0]);
        var decodedPayload = _decodeBase64Url(splittedToken[1]);
    } catch (err) {
        throw new TokenError('Token provided could not be decoded from base64Url');
    }

    // Check if valid JSON
    try {
        var jsonHeader = JSON.parse(decodedHeader);
        var jsonPayload = JSON.parse(decodedPayload);
    } catch (err) {
        throw new TokenError('Could not parse token to valid JSON');
    }

    // Generates new signature from decoded token to assert it equals the provided one
    var checkToken = header + "." + payload
    var checkSignature = crypto.Hmac('sha256', secret).update(checkToken).digest('string');
    checkSignature = _toBase64Url(checkSignature);

    if (signature !== checkSignature) throw new TokenError('Token provided does not match with the signature');

    return { header: jsonHeader, payload: jsonPayload };
}


// Verify an access token validity, throws error if invalid and returns user ID if valid
// isRefreshRequested argument used in case of requesting a new access token by using refresh token
const verifyAccessToken = (token, isRefreshRequested) => {

    // Verify the token structure, signature and decodes it 
    var checkedToken = _verifyIntegrity(token, TokenType.access);
    var header = checkedToken.header;
    var payload = checkedToken.payload;

    // Checking the different fields 
    if (header.alg !== 'HS256' || header.typ !== 'JWT') throw new TokenError('Access token invalid headers');

    if (payload.iss !== process.env.TOKEN_ISSUER) throw new TokenError('Access token invalid issuer');

    if (payload.iat > payload.exp) throw new TokenError('Access token invalid timestamps');

    // Check expiration time and returns error if a refreshed token is not required
    if ((payload.exp + 1) < Date.now()) {
        if (isRefreshRequested) return payload.sub;

        throw new TokenError('Access token expired');
    } else {
        // If token still valid and refreshed token required throws an error
        if (isRefreshRequested) throw new TokenError('Cannot refresh a token that has not expired');
    }

    // Returns the users ID if passes all the checks
    return payload.sub;
}

// Verify a refreshToken, throws error if invalid and returns user ID if valid
// Takes the refresh token and user ID as argument
// To be called right after verifyAccessToken with ID returned by it
const verifyRefreshToken = (token, userId) => {

    // Verify the token structure, signature and decodes it 
    var checkedToken = _verifyIntegrity(token, TokenType.refresh);
    var header = checkedToken.header;
    var payload = checkedToken.payload;

    // Checking the different fields 
    if (header.alg !== 'HS256' || header.typ !== 'JWT') throw new TokenError('Refresh token invalid headers');

    if (payload.iat > payload.exp) throw new TokenError('Refresh token invalid timestamps');

    //Check user ID and expiration time
    if (payload.sub !== userId) throw new TokenError('Refresh tokens owner ID not matching');

    if (payload.exp <= Date.now()) throw new TokenError('Refresh token expired');

    // Returns the user ID if passes all the checks
    return payload.sub;
}

module.exports = { TokenType, signedToken, verifyAccessToken, verifyRefreshToken };

