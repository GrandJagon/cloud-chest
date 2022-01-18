const router = require('express').Router();
const { checkAuth } = require('../middlewares/auth.middleware');
const { checkRight } = require('../middlewares/rights.middleware');
const { storeFiles } = require('../services/storage');
const { getContent, deleteContent, writeContent } = require('../controllers/content.controller');
const { log } = require('../middlewares/log.middleware');



// All routes from this page handle verything that is related to content such as adding, it, getting it or deleting it
// The album ID of which the content belongs to must nevertheless be provided in each request 

// Route to get an album content
router.get('/', log, checkAuth, checkRight('content:read'), getContent);

// Route to delete a specific content from a specific album
router.delete('/', log, checkAuth, checkRight('content:delete'), deleteContent);

// Route to upload files to an album
router.post('/', log, checkAuth, checkRight('content:add'), storeFiles, writeContent);



module.exports = router;

