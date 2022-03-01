const { ObjectId } = require('bson');
const mongoose = require('mongoose');

// Model used within the album schema, contains an user id an the rights it has on a given album
const userAccessSchema = new mongoose.Schema({
    userId: {
        type: ObjectId,
        required: true
    },
    email: {
        type: String,
        reauired: true
    },
    username: {
        type: String
    },
    rights: [],
});


module.exports = mongoose.model('UserAccess', userAccessSchema);