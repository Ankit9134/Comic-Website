const express = require('express');
const router = express.Router();
const accessLog = require('../middleware/accessLog');

const userRoute = require('./userRoute');
const genreRoute = require('./genreRoute');
const comicRoute = require('./comicRoute');
const bannerRoute = require('./bannerRoute');
const uploadRoute = require('./uploadRoute');

router.use('/user', accessLog, userRoute);
router.use('/genre', accessLog, genreRoute);
router.use('/comic', accessLog, comicRoute);
router.use('/banner', accessLog, bannerRoute);
router.use('/upload', accessLog, uploadRoute);

module.exports = router;