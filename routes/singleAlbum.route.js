const router = require('express').Router();
const { checkAuth } = require('../middlewares/auth.middleware');
const { checkRight } = require('../middlewares/rights.middleware');
const { storeFiles } = require('../services/storage');
const { getSingleAlbum, deleteContent, writeContent, editAlbum } = require('../controllers/singleAlbum.controller');
const { log } = require('../middlewares/log.middleware');



// All routes from this page handle verything that is related to content such as adding, it, getting it or deleting it
// The album ID of which the content belongs to must nevertheless be provided in each request 

// Route to get an album content
router.get('/', checkAuth, checkRight('content:read'), getSingleAlbum);

// Route to delete a specific content from a specific album
router.delete('/', checkAuth, checkRight('content:delete'), deleteContent);

// Route to upload files to an album
router.post('/', checkAuth, checkRight('content:add'), storeFiles, writeContent);

// Route to updates an album detais (title, thumbnail and users)
router.patch('/', checkAuth, checkRight('admin'), editAlbum);




module.exports = router;

