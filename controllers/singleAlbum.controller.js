const ObjectId = require('mongoose').Types.ObjectId;
const Album = require('../models/Album.model');
const File = require('../models/File.model');
const { deleteFiles } = require('../services/storage');
const ExifImage = require('exif').ExifImage;

// Request the content of album, returns list of file path
// Takes user ID and album ID from request as middleware appends them once verified
const getSingleAlbum = async (req, res) => {
    const album = req.album;


    try {
        return res.status(200).send(album);

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

            var _metadata = await _extractExif(file.path);

            newFiles.push(new File({
                id: file._id,
                path: file.path,
                size: file.size,
                mimetype: filetype,
                metadata: _metadata
            }));

            console.log(newFiles);

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


// Extratcs exif metadata from the uploaded content in order to save it in the db
const _extractExif =  async (path) => {

    return new Promise( function(resolve, reject) {
        new ExifImage({ image : path }, function( error, exifData ) {
            var exif = {}
            if (error) {
                console.log ('Error while extracting exif data '+error.message);
                return resolve({});
            }
            else 
                exif.creationDate = exifData.exif.CreateDate;
                if (Object.keys(exifData.gps).length > 0 ) exif.gps = exifData.gps;
                return resolve(exif);
        });

    });
    
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
        var filesId = files.map(f => ObjectId(f.id.toString()));
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

        return res.status(200).send("Deletion of " + files.length + " items successfull");

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


// Allows to add, edit or delete users accesses to a specific album
// Takes a userID, an albumID and the requested access as parameters
const _addUser = async (userId, albumId, album, requestedRights) => {
    // Checks if the user target ID provided is correct acreates user variable
    const targetUser = await User.findOne({ _id: userId });
    if (!targetUser) return res.status(400).send('"Target user ID incorrect"');

    // Checks if the requested right is valid such as declared in the model
    if (!requestedRights) return res.status(400).send('"Request must include requested rights"')

    // Checks if the requested rights are in the server defined list
    var validated = true;
    requestedRights.forEach(right => {
        validated = (Rights.includes(right));
    });
    if (!validated) return res.status(400).send('"Requested rights are not valid')

    try {
        // Updates entry in user object if exists
        const updateUser = await User.updateOne(
            { _id: targetUserId, "albums.albumId": albumId },
            {
                $set: {
                    "albums.$.title": album.title,
                    "albums.$.rights": requestedRights,
                    "albums.$.thumbnail": album.thumbnail
                }
            }
        );

        // Updates entry in album object if exists
        const updateAlbum = await Album.updateOne(
            { _id: albumId, "users.userId": userId },
            {
                $push: {
                    "users.$.rights": requestedRights
                }
            }
        )


        // If the update user did not find entry to modify creates it
        if (updateUser.modifiedCount <= 0) {

            await User.updateOne(
                { _id: targetUserId },
                {
                    $push: {
                        "albums": {
                            "albumId": albumId,
                            "title": album.title,
                            "rights": requestedRights,
                            "thumbnail": album.thumbnail
                        }
                    }
                }
            );
        }

        // If the update album did not find any entry to modify creates it
        if (updateAlbum.modifiedCount <= 0) {
            await Album.updateOne(
                { _id: albumId},
                {
                    $push: {
                        "users": {
                            "userId": userId,
                            "rights": requestedRights
                        }
                    }
                }
            )
        }

        console.log('Access sucessfully added to album '+albumId+ ' for user '+userId);

    } catch (err) {
        throw err;
    }

}

// Deletes an user from an album
// Propagates the change to the user object
const _deleteUser = async (userID, albumId, album) => {
    // Checks if the user target ID provided is correct acreates user variable
    const targetUser = await User.findOne({ _id: userId });
    if (!targetUser) return res.status(400).send('"Target user ID incorrect"');

    try {
        // Removes entry in user object
        const updateUser = await User.updateOne(
            { _id: targetUserId},
            {
                $unset: 
                    {
                        "albums.albumId": albumId 
                    }
            }
        );

        // Removes entry in album object
        const updateAlbum = await Album.updateOne(
            { _id: albumId, "users.userId": userId },
            {
                $push: {
                    "users.$.rights": requestedRights
                }
            }
        )
            console.log('User ' + userId +' successfully removed')

    } catch (err) {
        throw err;
    }
}

// Takes 2 lists of users, one for the current and one for the new that is being updated
// Compares them and returns 2 arrays, one for the users to be deleted, the other one to be added/edited
const _compareUsers = async (formerUsers, newUsers) => {

    console.log("NEW USERS");
    console.log(newUsers);
    console.log("FORMER USERS");
    console.log(formerUsers);

    const toAdd = [];

newUserLoop:
    for(var i in newUsers) {
        console.log('____________________________________________');
        newUser = newUsers[i];

        for(var j in formerUsers) {

            formerUser = formerUsers[j];

            console.log(newUser.email + ' against '+ formerUser.email);
            console.log(newUser.rights.toString() + ' against '+ formerUser.rights.toString());
            

            // New user was already in user list but rights have changed
            if(newUser.email == formerUser.email && newUser.rights.toString() != formerUser.rights.toString()) {
                console.log(newUser.email + ' already in list but rights have changed, to be added');
                toAdd.push(newUser);
                formerUsers.splice(j, 1);
                console.log("NEXT NEW USER");
                continue newUserLoop;
            }

            

            // New user was already in the list and rights did not change
            if (newUser.email == formerUser.email && newUser.rights.toString() == formerUser.rights.toString()) {
                console.log(newUser.email + ' found in the list with similar value, going to next new user');
                formerUsers.splice(j, 1);
                console.log('NEXT NEW USER');
                continue newUserLoop;
            }

            console.log("NOT MATCHING -> NEXT FORMER USER");
        }
        // If all the former user loop is gone through without match then new user is to be added
        toAdd.push(newUser);
        console.log("New user not found in list, to be added");
    }

   console.log("TO ADD => "+toAdd);
   console.log("TO DELETE => " + formerUsers);
   
}

// Handles album edit
// Takes title and/or thumbnail from the request and update the db
const editAlbum = async (req, res) => {

    const user = req.user;
    const newUsers = JSON.parse(req.body.users);

    const albumId = req.albumId;
    const album = req.album;

    // Fetching new values from request or assigning to old ones if not
    var newTitle = req.body.title;
    if (!newTitle) newTitle = album.title;


    var newThumbnail = req.body.thumbnail;
    if (!newThumbnail) newThumbnail = album.thumbnail;

    try {

        // DEBUG MODE FIRST PROPAGATE
        _compareUsers(album.users, newUsers);

        return;


        // Updates the album object with the new values
        await Album.updateOne(
            { _id: albumId },
            {
                title: newTitle,
                description: newDesc,
                thumbnail: newThumbnail,
                users: newUsers
            }
        );

        // Propagate the updates to all the users having access to the album
        // Necessaray because they got access to title and thumbnail in their accesses
        for (const userId of album.users) {
            await User.updateOne(
                { _id: userId, "albums.albumId": albumId },
                {
                    "albums.$.title": newTitle,
                    "albums.$.thumbnail": newThumbnail
                }
            );
        }

        return res.status(200).send('Successfully updated');


    } catch (err) {
        console.log(err.stack);
        return res.status(500).send(err.messages);
    }

}


module.exports = { getSingleAlbum, writeContent, deleteContent, editAlbum};