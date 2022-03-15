const User = require('../models/User.model');
const Album = require('../models/Album.model');


// Verify that the request is correct and that the user has the proper rights to perform action on an album
const checkRight = (right) => {

    return async (req, res, next) => {
        const user = req.user;

        // Getting album ID from route param
        const albumId = req.query.albumId;
        if (!albumId) return res.status(400).send('No album ID provided');

        // Check if album exists
        const albumObject = await Album.findOne({ _id: albumId });
        if (!albumObject) return res.status(400).send('Album does not exist');

        // Checks if the user has access to the album
        const album = user.albums.find(album => album.albumId == albumId);
        if (!album) return res.status(403).send('User has no access to this album');

        // Cheks if user has the right provided in parameter or is admin
        const perm = album.rights.includes('admin') || album.rights.includes(right) || !right;
        if (!perm) return res.status(403).send('User has no permission to perform this operation');


        // Sets the value in the request
        req.albumId = albumId;
        req.album = albumObject;
        req.user = user;

        next();
    }

}


module.exports = { checkRight }