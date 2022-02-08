const { Decimal128 } = require('bson');
const mongoose = require('mongoose');

// Model for a file object containing the file path in local storage and the metadatas
const fileSchema = new mongoose.Schema({
    path: {
        type: String,
        required: true
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
    },
    metadata : {
        type: Map,
        of: String
    },
});

module.exports = mongoose.model('File', fileSchema);