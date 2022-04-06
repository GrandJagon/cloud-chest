const router = require('express').Router();
const { checkAuth } = require('../middlewares/auth.middleware');
const { checkContentAccess } = require('../middlewares/rights.middleware');

// Route that will be used to serve the content to the app
router.get('*', checkAuth, checkContentAccess);


module.exports = router;