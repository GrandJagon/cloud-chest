const ObjectId = require('mongoose').Types.ObjectId;
const User = require('../models/User.model');
const Album = require('../models/Album.model');
const AlbumAccess = require('../models/AlbumAccess.model');
const Rights = require('../models/Rights.model');
const { deleteFiles } = require('../services/storage');

// Returns an array with an users albums
const albumsGet = async (req, res) => {
    // Fetches user in db according to id provided by the auth middleware (once token verified)
    const user = await User.findOne({ _id: ObjectId(req.user) });

    if (!user) return res.status(400).send('User ID not matching the database');

    if (user.albums.length <= 0) return res.status(200).send({ 'albumList': [], 'message': 'You have not album yet...' });

    try {

        userAlbums = user.albums

        return res.status(200).send({ 'albumList': userAlbums, 'message': 'success' });

    } catch (err) {
        return res.status(500).send(err.message);
    }
}

// Creates an album for a given user with the default permissions to read and write
// Returns the album ID and redirects to this specific album endpoint
const createAlbumPost = async (req, res) => {
    // Fetches user in db according to id provided by the auth middleware (once token verified)
    const user = await User.findOne({ _id: ObjectId(req.user) });
    if (!user) return res.status(400).send('User ID not matching database');


    // Assigning default values for title and description if user doesnt provide one
    var albumTitle = req.body.title;
    if (!albumTitle) albumTitle = 'My album';

    var albumDesc = req.body.description;
    if (!albumDesc) albumDesc = '';

    try {

        // Creating the album object with title and description provided by user (or default values)
        const newAlbum = new Album({
            title: albumTitle,
            description: albumDesc,
            owner: user._id,
            size: {
                items: {}
            }
        });

        await newAlbum.save();

        // Creating the albumAccess object to append in the user document
        // Contains the album ID, title, description and the users rights in the album
        const newAlbumAccess = new AlbumAccess({
            albumId: newAlbum._id,
            title: albumTitle,
            description: albumDesc,
            rights: ['admin']
        })

        // Appending the content and saving the users documents
        await user.albums.push(newAlbumAccess)
        await user.save()

        return res.status(200).send({ 'albumId': newAlbum._id, 'title': albumTitle, 'description': albumDesc });

    } catch (err) {
        res.status(500).send(err.message);
    }
}


// Deletes an album in users albums
// Takes user ID and album ID from request as middleware appends them once verified
const deleteAlbum = async (req, res) => {
    const userId = req.userId;
    const albumId = req.albumId;
    const album = req.album;

    // Fetching the album content
    const files = await album.files.map(a => a.path);
    if (!files) return res.status(400).send('Album empty')

    // Deleting the album content
    await deleteFiles(files, (err) => {
        if (err) return res.status(500).send('Error while deleting album content');
    });

    try {

        // Removing album from the database and the entry from the users object
        await Album.deleteOne({ _id: albumId });

        await User.updateOne(
            { _id: userId },
            { $pull: { 'albums': { 'albumId': ObjectId(albumId) } } }
        );

        return res.status(200).send('"Deletion successfull"');
    } catch (err) {

        res.status(400).send(err.message);
    }
}

// Allows to add, edit or delete user accesses to a specific album
// Takes a userID, an albumID and the requested access as parameters
const addAccess = async (req, res) => {

    const albumId = req.albumId;
    const album = req.album;

    // Checks if the user target ID provided is correct acreates user variable
    const targetUserId = req.body.targetId;
    const targetUser = await User.findOne({ _id: targetUserId });
    if (!targetUser) return res.status(400).send('"Target user ID incorrect"');

    // Checks if the requested right is valid such as declared in the model
    const requestedRights = req.body.rights;
    if (!requestedRights) return res.status(400).send('"Request must include requested rights"')

    // Checks if the requested rights are in the server defined list
    var validated = true;
    requestedRights.forEach(right => {
        validated = (Rights.includes(right));
    });
    if (!validated) return res.status(400).send('"Requested rights are not valid')

    try {
        // Updates entry if exists
        const updateResult = await User.updateOne(
            { _id: targetUserId, "albums.albumId": albumId },
            {
                $set: {
                    "albums.$.title": album.title,
                    "albums.$.rights": requestedRights,
                    "albums.$.thumbnail": album.thumbnail
                }
            }
        );

        // If the update did not fiond entry to modify creates it
        if (updateResult.modifiedCount <= 0) {

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

        return res.status(200).send('Access successfully added');

    } catch (err) {
        return res.status(500).send(err.stack);
    }

}

// Handles album edit
// Takes title, desc and/or thumbnail from the request and update the db
const editAlbum = async (req, res) => {

    const albumId = req.albumId;
    const album = req.album;

    // Fetching new values from request or assigning to old ones if not
    var newTitle = req.body.title;
    if (!newTitle) newTitle = album.title;

    var newDesc = req.body.desc;
    if (!newDesc) newDesc = album.description;

    var newThumbnail = req.body.thumbnail;
    if (!newThumbnail) newThumbnail = album.thumbnail;

    try {

        // Updates the album object with the new values
        await Album.updateOne(
            { _id: albumId },
            {
                title: newTitle,
                description: newDesc,
                thumbnail: newThumbnail
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
        return res.status(500).send(err.messages);
    }

}



module.exports = { albumsGet, createAlbumPost, deleteAlbum, addAccess, editAlbum }