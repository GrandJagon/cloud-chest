const mongoose = require('mongoose');

// Requires the content model that will be used 
const AlbumAccess = require('./AlbumAccess.model').schema;

// Model for users such as stored in the database
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        min: 6,
        max: 50
    },
    username: {
        type: String,
        required: true,
        min: 6,
        max: 50
    },
    password: {
        type: Object,
        required: true
    },
    albums: [AlbumAccess],
    creationDate: {
        type: Date,
        default: Date.now
    },
    isActive: {
        type: Boolean,
        default: true
    }
});

module.exports = mongoose.model('User', userSchema);