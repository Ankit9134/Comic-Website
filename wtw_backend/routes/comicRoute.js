const express = require('express');
const router = express.Router();
const Joi = require('joi');
const _ = require('lodash');
const comicCtrl = require('../controller/comic');
const constants = require('../config/constants');
const common = require('../lib/commonFunctions');
const { logger } = require('../lib/logger');
const { NotFoundError, FileUploadError } = require('../lib/errors');
const auth = require('../middleware/auth');

router.get('/getAllComics', async (req, res) => {
    try {
        const result = await comicCtrl.getAll();
        logger.info(constants.LOGGER_TYPE_ROUTE, __file, '/getAllComics', '', '', `Comics fetched successfully`);
        common.sendResponse(req, res, true, constants.SUCCESS_STATUS_200, `All comics fetched`, _.map(result, formatSingleComicContent));
    } catch (error) {
        logger.error(constants.LOGGER_TYPE_ROUTE, __file, '/getAllComics', '', '', `Comic fetch failed`, error);
        common.sendResponse(req, res, false, error.statusCode || constants.ERROR_STATUS_400, error.message || 'Failed to fetch comics', error);
    }
});

router.get('/getPaginatedComics', async (req, res) => {
    try {
        const schema = Joi.object({
            page: Joi.number().min(1).default(1).optional(),
            limit: Joi.number().min(1).max(100).default(10).optional(),
            genreIds: Joi.array().items(Joi.number()).optional(),
            search: Joi.string().optional(),
            sort: Joi.string().valid('newest', 'oldest').optional()
        });

        const { error } = schema.validate(req.query);
        if (error) {
            throw new Error(error.details[0].message);
        }

        const result = await comicCtrl.getPaginatedComics(req.query.page, req.query.limit, req.query.genreIds || [], req.query.search, req.query.sort);
        const formattedResult = {
            "totalRows": _.get(result, 'totalRows', 0),
            "currentPage": _.get(result, 'currentPage', 1),
            "totalPages": _.get(result, 'totalPages', 1),
            "limit": _.get(result, 'limit', 10),
            "comics": _.map(result.rows, formatSingleComicContent),
        };
        logger.info(constants.LOGGER_TYPE_ROUTE, __file, '/getPaginatedComics', '', '', `Comics fetched successfully`);
        common.sendResponse(req, res, true, constants.SUCCESS_STATUS_200, `All comics fetched`, formattedResult);
    } catch (error) {
        logger.error(constants.LOGGER_TYPE_ROUTE, __file, '/getPaginatedComics', '', '', `Comic fetch failed`, error);
        common.sendResponse(req, res, false, error.statusCode || constants.ERROR_STATUS_400, error.message || 'Failed to fetch comics', error);
    }
});

router.get('/getComicDetail', async (req, res) => {
    try {
        const schema = Joi.object({
            comicId: Joi.number().required()
        });

        const { error } = schema.validate(req.query);
        if (error) {
            throw new Error(error.details[0].message);
        }

        const result = await comicCtrl.getComicDetailByComicId(req.query.comicId);
        if (!result) {
            throw new NotFoundError(`Comic with ID ${req.query.comicId} not found`);
        }
        logger.info(constants.LOGGER_TYPE_ROUTE, __file, '/getComicDetail', '', '', `Comic fetched successfully`);
        common.sendResponse(req, res, true, constants.SUCCESS_STATUS_200, `Comic fetched`, formatSingleComicContent(result));
    } catch (error) {
        if (error instanceof NotFoundError) {
            logger.warn(constants.LOGGER_TYPE_ROUTE, __file, '/getComicDetail', '', '', `Not found error: ${error.message}`);
            common.sendResponse(req, res, false, error.statusCode, error.message, error);
        } else {
            logger.error(constants.LOGGER_TYPE_ROUTE, __file, '/getComicDetail', '', '', `Comic fetch failed`, error);
            common.sendResponse(req, res, false, error.statusCode || constants.ERROR_STATUS_400, error.message || 'Failed to fetch comic', error);
        }
    }
});

router.get('/getAdminDashboardCounts', auth.validateAdminAccessToken, async (req, res) => {
    try {
        const result = await comicCtrl.getAdminDashboardCounts();
        logger.info(constants.LOGGER_TYPE_ROUTE, __file, '/getAdminDashboardCounts', '', '', `Admin dashboard counts fetched successfully`);
        common.sendResponse(req, res, true, constants.SUCCESS_STATUS_200, `Admin dashboard counts fetched`, result);
    } catch (error) {
        logger.error(constants.LOGGER_TYPE_ROUTE, __file, '/getAdminDashboardCounts', '', '', `Admin dashboard counts fetch failed`, error);
        common.sendResponse(req, res, false, error.statusCode || constants.ERROR_STATUS_400, error.message || 'Failed to fetch dashboard counts', error);
    }
});

router.post('/addNewComic', auth.validateAdminAccessToken, async (req, res) => {
    try {
        const schema = Joi.object({
            comicName: Joi.string().required(),
            description: Joi.string().required(),
            genreId: Joi.number().required(),
            comicContent: Joi.array().items(
                Joi.object({
                    imageFileName: Joi.string().required(),
                    audioFileName: Joi.string().required(),
                    length: Joi.number().required(),
                    sceneNumber: Joi.number().required()
                })
            ).required()
        });

        const { error } = schema.validate(req.body);
        if (error) {
            throw new Error(error.details[0].message);
        }

        const result = await comicCtrl.saveComicWithContent(req.body, null, req.userDetails);
        logger.info(constants.LOGGER_TYPE_ROUTE, __file, '/addNewComic', '', '', `Comic created successfully - ${JSON.stringify(result)}`);
        common.sendResponse(req, res, true, constants.SUCCESS_STATUS_200, `New comic has been created`, formatSingleComicContent(result));
    } catch (error) {
        logger.error(constants.LOGGER_TYPE_ROUTE, __file, '/addNewComic', '', '', `Comic creation failed`, error);
        common.sendResponse(req, res, false, error.statusCode || constants.ERROR_STATUS_400, error.message || 'Failed to create comic', error);
    }
});

router.post('/updateComic', auth.validateAdminAccessToken, async (req, res) => {
    try {
        const schema = Joi.object({
            comicId: Joi.number().required(),
            comicName: Joi.string().required(),
            description: Joi.string().required(),
            genreId: Joi.number().required(),
            comicContent: Joi.array().items(
                Joi.object({
                    imageFileName: Joi.string().required(),
                    audioFileName: Joi.string().required(),
                    length: Joi.number().required(),
                    sceneNumber: Joi.number().required()
                })
            ).required()
        });

        const { error } = schema.validate(req.body);
        if (error) {
            throw new Error(error.details[0].message);
        }

        const result = await comicCtrl.saveComicWithContent(req.body, req.body.comicId, req.userDetails);
        logger.info(constants.LOGGER_TYPE_ROUTE, __file, '/updateComic', '', '', `Comic updated successfully - ${JSON.stringify(result)}`);
        common.sendResponse(req, res, true, constants.SUCCESS_STATUS_200, `Comic updated successfully`, formatSingleComicContent(result));
    } catch (error) {
        if (error instanceof NotFoundError) {
            logger.warn(constants.LOGGER_TYPE_ROUTE, __file, '/updateComic', '', '', `Not found error: ${error.message}`);
            common.sendResponse(req, res, false, error.statusCode, error.message, error);
        } else {
            logger.error(constants.LOGGER_TYPE_ROUTE, __file, '/updateComic', '', '', `Comic update failed`, error);
            common.sendResponse(req, res, false, error.statusCode || constants.ERROR_STATUS_400, error.message || 'Failed to update comic', error);
        }
    }
});

router.get('/deleteComic', auth.validateAdminAccessToken, async (req, res) => {
    try {
        const schema = Joi.object({
            comicIds: Joi.array().items(Joi.number()).required(),
        });

        const { error } = schema.validate(req.query);
        if (error) {
            throw new Error(error.details[0].message);
        }

        const result = await comicCtrl.deleteComicWithContent(req.query.comicIds);
        if (!result) {
            throw new NotFoundError(`Comic with ID ${req.query.comicId} not found`);
        }
        logger.info(constants.LOGGER_TYPE_ROUTE, __file, '/deleteComic', '', '', `Comic deleted successfully`);
        common.sendResponse(req, res, true, constants.SUCCESS_STATUS_200, `Comic deleted successfully`);
    } catch (error) {
        if (error instanceof NotFoundError) {
            logger.warn(constants.LOGGER_TYPE_ROUTE, __file, '/deleteComic', '', '', `Not found error: ${error.message}`);
            common.sendResponse(req, res, false, error.statusCode, error.message, error);
        } else {
            logger.error(constants.LOGGER_TYPE_ROUTE, __file, '/deleteComic', '', '', `Comic deletion failed`, error);
            common.sendResponse(req, res, false, error.statusCode || constants.ERROR_STATUS_400, error.message || 'Failed to delete comic', error);
        }
    }
});


const formatSingleComicContent = (comicData) => {
    if (comicData && comicData.id) {
        const returnData = {
            "id": comicData.id,
            "comicName": comicData.comicName,
            "description": comicData.description,
            "createdAt": comicData.createdAt,
            "genreId": comicData.genreId,
            "genreName": _.get(comicData, 'genre.genreName', null),
            "comicContent": []
        };

        if (comicData.comicContent && Array.isArray(comicData.comicContent) && comicData.comicContent.length > 0) {
            comicData.comicContent.forEach((element) => {
                returnData.comicContent.push({
                    id: element.id,
                    imageFileName: element.imageFileName,
                    imageURL: element.imageFileName ? `${process.env.BASE_URL}/upload/getFileFromCloud?key=${element.imageFileName}` : null,
                    audioFileName: element.audioFileName,
                    audioURL: element.audioFileName ? `${process.env.BASE_URL}/upload/getFileFromCloud?key=${element.audioFileName}` : null,
                    length: element.length,
                    sceneNumber: element.sceneNumber,
                })
            });
        }
        return returnData;
    }
    return {};
};

module.exports = router;