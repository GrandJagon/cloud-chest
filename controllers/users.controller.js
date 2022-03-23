require('dotenv').config({ path: '../.env' });
const Album = require('../models/Album.model');
const User = require("../models/User.model");
const { salt, saltHash } = require('../services/hasher');
const { deleteFiles } = require('../services/storage');

// Edits a user profile
const editUser = async (req, res) => {
    const user = req.user;
    const userId = req.userId;

    // Fetching requested update from the request or keep same values if null 
    if (req.body.email) {
        const emailExists = await User.findOne({ email: req.body.email })
        if (emailExists) return res.status(400).send(JSON.stringify('Email already in use'));
    }
    var newEmail;

    req.body.email != null ? newEmail = req.body.email : user.email;

    if (req.body.username) {
        const usernameExists = await User.findOne({ username: req.body.username })
        if (usernameExists) return res.status(400).send('Email already in use');
    }

    var newUsername;
    req.body.uername != null ? newUsername = req.body.username : newUsername = user.username;

    const newPassword = req.body.password ? saltHash(newPassword, salt(process.env.SALT_LENGTH)) : user.password;

    try {

        // Updates the database
        await User.updateOne(
            { _id: userId },
            {
                $set: {
                    "email": newEmail,
                    "username": newUsername,
                    "password": newPassword
                }
            }
        );

        res.status('200').send(JSON.stringify('Update succesfull'));

    } catch (err) {
        return res.status(500).send(err.message);
    }


}

// Finds a user given mail address
const findUser = async (req, res) => {
    try {
      
        var user = await User.find({ username: req.query.search });
    
        if(user.length < 1) user = await User.find({ email: req.query.search });

        if(user.length > 0) return res.status(200).send(user);

        return res.status(404).send(null);

    } catch(err){
        return res.status(500).send(err.message);
    }
}

// Deletes a user and any album that they own
const deleteUser = async (req, res) => {
    const userId = req.userId;

    try {
        // Fetching all albums owned by the user
        const userAlbums = await Album.find({ owner: userId });

        const userFiles = []

        // Extracting all the file path of those albums and push it into array
        userAlbums.map((album) => {
            if (album.files.length > 0) album.files.forEach(file => {
                userFiles.push(file.path);
            });

        });

        // Delete the files
        await deleteFiles(userFiles, (err) => {
            if (err) return res.status(500).send(JSON.stringify('Error while deleting files'));
        });

        // Delete the albums from the db
        await Album.deleteMany({ owner: userId });

        // Delete the user from the db
        await User.deleteOne({ _id: userId });

        res.status(200).send(JSON.stringify('User successfully deleted'));

    } catch (err) {
        res.status(500).send(err.message)
    }
}



module.exports = { editUser, deleteUser, findUser };