const { Decimal128 } = require('bson');
const mongoose = require('mongoose');

// Model for a file object containing the file path in local storage and the metadatas
const fileSchema = new mongoose.Schema({
    path: {
        type: String,
        required: true
    },
    creationDate: {
        type: Date
    },
    latitude: {
        type: String
    },
    longitude: {
        type: String
    },
    location: {
        type: String
    },
    storageDate: {
        type: Date,
        default: Date.now()
    },
    size: {
        type: Number
    },
    mimetype: {
        type: String
    }
});

module.exports = mongoose.model('File', fileSchema);