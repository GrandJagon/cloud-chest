

// Custom error that contains a message and a HTTP status
// To be caught and sent with a response for a failed request
class APIError extends Error {
    constructor(status, ...params) {

        // Passes the regular argument to the parent class
        super(...params);

        this.name = 'APIError';

        this.status = status;
    }
};


module.exports = APIError;