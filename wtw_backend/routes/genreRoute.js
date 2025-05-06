const express = require('express');
const router = express.Router();
const Joi = require('joi');
const genreCtrl = require('../controller/genre');
const constants = require('../config/constants');
const common = require('../lib/commonFunctions');
const { logger } = require('../lib/logger');
const auth = require('../middleware/auth');
router.get('/getAllGenres', async (req, res) => {
    try {
        const result = await genreCtrl.getAll();
        logger.info(constants.LOGGER_TYPE_ROUTE, __file, '/getAllGenres', '', '', `Genres fetched successfully`);
        common.sendResponse(req, res, true, constants.SUCCESS_STATUS_200, `All genres fetched`, result);
    } catch (error) {
        logger.error(constants.LOGGER_TYPE_ROUTE, __file, '/getAllGenres', '', '', `Genre fetch failed`, error);
        common.sendResponse(req, res, false, error.statusCode || constants.ERROR_STATUS_400, error.message || 'Failed to fetch genres', error);
    }
});

router.post('/addNewGenre', auth.validateAdminAccessToken, async (req, res) => {
    try {
        const schema = Joi.object({
            genreName: Joi.string().required(),
        });

        const { error } = schema.validate(req.body);
        if (error) {
            throw new Error(error.details[0].message);
        }

        const result = await genreCtrl.saveGenre(req.body, null, req.userDetails);
        logger.info(constants.LOGGER_TYPE_ROUTE, __file, '/addNewGenre', '', '', `Genre created successfully - ${JSON.stringify(result)}`);
        common.sendResponse(req, res, true, constants.SUCCESS_STATUS_200, `New genre has been created`, result);
    } catch (error) {
        logger.error(constants.LOGGER_TYPE_ROUTE, __file, '/addNewGenre', '', '', `Genre creation failed`, error);
        common.sendResponse(req, res, false, error.statusCode || constants.ERROR_STATUS_400, error.message || 'Failed to create genre', error);
    }
});

module.exports = router;
