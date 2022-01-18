const router = require('express').Router();
const { checkAuth } = require('../middlewares/auth.middleware');
const { editUser, deleteUser } = require("../controllers/users.controller");
const { log } = require('../middlewares/log.middleware');

// Route to edit a user profile
router.patch('/', log, checkAuth, editUser);

// Route to delete a user
router.delete('/', log, checkAuth, deleteUser);

module.exports = router;





