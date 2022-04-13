const router = require('express').Router();
const { checkAuth } = require('../middlewares/auth.middleware');
const { editUser, deleteUser, findUser, findUserById, resetPassword } = require("../controllers/users.controller");

// Route to edit a user profile
router.patch('/',  checkAuth, editUser);

// Route to delete a user
router.delete('/', checkAuth, deleteUser);

// Route to find a particular user
router.get('/', checkAuth, findUser);

// Route to find a particular user
router.get('/byId', checkAuth, findUserById);

// Route to reset a forgotten password
router.post('/resetPassword', resetPassword);

module.exports = router;





