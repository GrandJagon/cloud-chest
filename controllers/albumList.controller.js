const ObjectId = require('mongoose').Types.ObjectId;
const User = require('../models/User.model');
const Album = require('../models/Album.model');
const AlbumAccess = require('../models/AlbumAccess.model');
const UserAccess = require('../models/UserAccess.model');
const Rights = require('../models/Rights.model');
const { deleteFiles } = require('../services/storage');
const fs = require('fs');

// Returns an array with a users albums
const albumsGet = async (req, res) => {
    // Fetches user in db according to id provided by the auth middleware (once token verified)
    const user = await User.findOne({ _id: ObjectId(req.user) });

    if (!user) return res.status(400).send('User ID not matching the database');

    if (user.albums.length <= 0) return res.status(200).send([]);

    try {

        userAlbums = user.albums;

        return res.status(200).send(userAlbums);

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

    try {

        // Creating the album object with title and description provided by user (or default values)
        const newAlbum = new Album({
            title: albumTitle,
            users: [],
            size: {
                items: {}
            }
        });

         // Creates a new user access object to put in the album 
        // Allows to fetch all the users currently using this album
        const newUserAccess = new UserAccess({
            userId: user._id,
            email: user.email,
            username: user.username,
            rights: ['admin']
        });

        await newAlbum.users.push(newUserAccess);

        await newAlbum.save();

        // Creating the albumAccess object to append in the user document
        // Contains the album ID, title, description and the users rights in the album
        const newAlbumAccess = new AlbumAccess({
            albumId: newAlbum._id,
            title: albumTitle,
            rights: ['admin']
        });
    

        // Appending the content and saving the users documents
        await user.albums.push(newAlbumAccess);
        await user.save();
        
        var albumPath = './storage/'+newAlbum._id;

        // Finally creating the folder dedicated to the album
        await fs.promises.mkdir(albumPath, { recursive: true }, function(err){
            if(err){
                console.log('Failed to create '+albumPath);
                throw err;
            }
        });

        return res.status(200).send({ 'albumId': newAlbum._id, 'title': albumTitle, 'rights':['admin']});

    } catch (err) {
        console.log(err);
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

        return res.status(200).send(JSON.stringify('Deletion successfull'));
    } catch (err) {

        res.status(400).send(err.message);
    }
}





module.exports = { albumsGet, createAlbumPost, deleteAlbum }