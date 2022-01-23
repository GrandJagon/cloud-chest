const ObjectId = require('mongoose').Types.ObjectId;
const Album = require('../models/Album.model');
const File = require('../models/File.model');
const { deleteFiles } = require('../services/storage');

// Request the content of album, returns list of file path
// Takes user ID and album ID from request as middleware appends them once verified
const getContent = async (req, res) => {
    const album = req.album;

    try {
        return res.status(200).send(album.files);

    } catch (err) {
        return res.status(500).send(err.message);
    }
}

// Last step of upload process, writes the files path in the db
// Takes albumID and user ID from request as middleware appends them once verified
const writeContent = async (req, res) => {
    const album = req.album;
    const albumId = req.albumId;
    const files = req.files;

    try {

        // Fetching the items map that holds the amount for each mimetype
        var itemMap = album.size.items;
        const newFiles = [];

        // For each stored file creating a new mongoose object and appending it to the album document
        for (const file of files) {
            // Type inference
            var filetype = file.filename.split('.').at(-1);

            newFiles.push(new File({
                path: file.path,
                size: file.size,
                mimetype: filetype
            }));

            // Update the item map with the new file type
            itemMap = _updateItemMap(itemMap, file, filetype, 'add');
        };

        // Update the album object withint the database
        await Album.updateOne(
            { _id: albumId },
            {
                $set: {
                    "size.items": itemMap
                },
                $inc: {
                    "size.total": files.length
                },
                $push: {
                    "files": newFiles
                }
            }
        );

        // Returns the files object to client for storing the names in a correspondance table
        // That will allow they to not download each time the file they still have locally
        return res.status(200).send(newFiles);

    } catch (err) {
        console.log(err.stack);

        return res.status(400).send(err.message);
    }
}

// Deletes specific files from given album
// Takes album ID from request as middleware appends it once verified
// Files parameters should include id and path as well as mimetype
const deleteContent = async (req, res) => {
    const albumId = req.albumId;
    const album = req.album;
    const files = req.body;

    // Check that files to delete are in the request
    if (!files) return res.status(400).send('Files to delete should be specified in request');

    var itemMap = album.size.items;

    // Check if files in the request has a proper structure and store id and path into variables
    try {
        var filesId = files.map(f => ObjectId(f._id.toString()));
        var filesPath = files.map(f => f.path);

        // Updates the item map by removing the count of file according to their mimetype
        files.forEach(file => {
            itemMap = _updateItemMap(itemMap, file, 'remove');
        });
    } catch (err) {
        return res.status(400).send('Error while extracting files to delete from request => ' + err.stack);
    }

    // Delete the files from the storage
    await deleteFiles(filesPath, (err) => {
        if (err) return res.status(500).send(err.message)
    });

    try {
        // Updates the album object 
        await Album.updateOne(
            { _id: albumId },
            {
                $pull: {
                    "files": {
                        _id: { $in: filesId }
                    }
                },
                $inc: {
                    "size.total": -files.length
                },
                $set: {
                    "size.items": itemMap
                }
            }
        );

        return res.status(200).send('Deletion of ' + files.length + ' items successfull');

    } catch (err) {
        return res.status(500).send(err.message);
    }
}

// Updates the album items stats with the newly added files
// action can be 'add' or 'remove' in order to add or substract from the stats
const _updateItemMap = (itemMap, file, type, action) => {

    try {
        const amount = action == 'add' ? 1 : -1;

        itemMap[type] = Object.keys(itemMap).includes(type) ? itemMap[type] + amount : 1;

        if (itemMap[type] < 1) delete itemMap[type];

        return itemMap;

    } catch (err) {
        throw Error('Error while updating the album stats => ' + err.stack);
    }

}


module.exports = { getContent, writeContent, deleteContent };