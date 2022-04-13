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

// Verify that a user has access to the given album in order to serve the content
// Only checks for that in order to make it lighter as it will be called many times to get album content
const checkContentAccess = (req, res, next) => {
    
    const user = req.user;
    const albumId = req.originalUrl.split('storage/').at(-1).split('/').at(0);
    
    // Checks if the user has access to the album
    const album = user.albums.find(album => album.albumId == albumId);
    if (!album) return res.status(403).send('Access denied');

    

    next();
}


module.exports = { checkRight, checkContentAccess }