const crypto = require('crypto');

// Generates random salt with nb hex characters (<=32)
const salt = nb => {
    if (typeof nb !== 'number') throw new Error('Parameter must be a number');

    if (nb > 32) throw new Error('Parameter must not be more than 32');

    if (typeof nb == null) throw new Error('Parameter must not be null');

    return crypto.randomBytes(Math.ceil(nb / 2)).toString('hex').slice(0, nb);
}

// Generates a hash given a string and a salt
const _saltHasher = (str, salt) => {

    // Generates HMAC with salt as secret
    let hash = crypto.Hmac('sha512', salt).update(str).digest('hex');

    return {
        salt: salt,
        hash: hash
    };
};

// Function that wraps hashing with input validation
const saltHash = (str, salt) => {
    if (str == null || salt == null) throw new Error('Both inputs are required are required');

    if (typeof str !== 'string' || typeof salt !== 'string') {
        throw new Error('Both inputs must be of type string');
    }

    return _saltHasher(str, salt);
}

// Generates a hash given a string and an algorithm
const hash = (str, alg) => {

    // Generates HMAC with salt as secret
    let hash = crypto.createHash(alg).update(str).digest('hex');

    return hash;
};


// Function that takes a string and a hash and compares them 
// hashObject : {salt: salt, hash, hash}
// Returns boolean
const compare = (string, hashObject) => {
    const salt = hashObject.salt;
    const hash = hashObject.hash;

    const hashedString = _hasher(string, salt);

    if (hashedString.hash !== hash) return false;

    return true;
}

module.exports = {
    salt,
    saltHash,
    hash,
    compare
}





