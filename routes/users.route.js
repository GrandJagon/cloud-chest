const router = require('express').Router();
const { checkAuth } = require('../middlewares/auth.middleware');
const { editUser, deleteUser } = require("../controllers/users.controller");

// Route to edit a user profile
router.patch('/', checkAuth, editUser);

// Route to delete a user
router.delete('/', checkAuth, deleteUser);

module.exports = router;





