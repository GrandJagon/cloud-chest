const ObjectId = require('mongoose').Types.ObjectId;
const User = require('../models/User.model');
const Album = require('../models/Album.model');
const Rights = require('../models/Rights.model');

// Returns the detqils of a given album
const albumDetailsGet = async (req, res) => {
    const album = req.album;

    const albumDetail = {
        'title':album.title,
        'thumbnail': album.thumbnail,
        'creationDate' : album.creationDate,
        'users': album.users,
        'size': album.size
    };

    try {
        res.status(200).send(albumDetail);
    } catch(err){
        res.status(500).send(err.message);
    }


}