const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { hash } = require('./hasher');

// Creation of the storage object with the storage folder and a function to assign name to uploaded files
const storage = multer.diskStorage({
    destination: './storage/',
    filename: (req, file, cb) => {
        // Generating a file path by hasing name concatened with timestamp
        const filename = file.originalname + Date.now().toString();

        const filehash = hash(filename, 'md5');
        console.log(path.extname(filehash));

        cb(null, filehash + path.extname(file.originalname));
    },
});

// Function responsible for storingfiles to the storage
const storeFiles = multer({
    storage: storage
}).array('files');

// Deletes multiple files from from files path array
// Should be called with a callback as argument in case of error
const deleteFiles = async (files, cb) => {
    files.forEach((filepath) => {
        fs.unlink(filepath, (err) => {
            if (err) {
                cb(err);
                return;
            }
        });
    });
}

module.exports = { storeFiles, deleteFiles };