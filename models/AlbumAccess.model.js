const { ObjectId } = require('bson');
const mongoose = require('mongoose');

// Model used within the user schema, contains an album id and the rights that the user has on it
const albumAccessSchema = new mongoose.Schema({
    albumId: {
        type: ObjectId,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    thumbnail: {
        type: String
    },
    rights: [],
});


module.exports = mongoose.model('AlbumAccess', albumAccessSchema);