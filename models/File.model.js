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
        type: Decimal128
    },
    longitude: {
        type: Decimal128
    },
    storageDate: {
        type: Decimal128,
        default: Date.now()
    },
    size: {
        type: Decimal128
    },
    mimetype: {
        type: String
    }
});

module.exports = mongoose.model('File', fileSchema);