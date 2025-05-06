const express = require('express');
const router = express.Router();
const Joi = require('joi');
const bannerCtrl = require('../controller/banner');
const constants = require('../config/constants');
const common = require('../lib/commonFunctions');
const { logger } = require('../lib/logger');
const auth = require('../middleware/auth');
const config = require('../config');
router.get('/getAllBanners', async (req, res) => {
    try {
        const result = await bannerCtrl.getAll();
        logger.info(constants.LOGGER_TYPE_ROUTE, __file, '/getAllBanners', '', '', `Banners fetched successfully`);
        common.sendResponse(req, res, true, constants.SUCCESS_STATUS_200, `All banners fetched`, formatResult(result));
    } catch (error) {
        logger.error(constants.LOGGER_TYPE_ROUTE, __file, '/getAllBanners', '', '', `Banner fetch failed`, error);
        common.sendResponse(req, res, false, error.statusCode || constants.ERROR_STATUS_400, error.message || 'Failed to fetch banners', error);
    }
});

router.post('/saveBanner', auth.validateAdminAccessToken, async (req, res) => {
    try {
        const schema = Joi.object({
            bannerId: Joi.number().required(),
            banner1Image: Joi.string().required(),
            banner1ImageURL: Joi.string().optional(),
            banner1Link: Joi.string().required(),
            banner1Title: Joi.string().required(),
            banner1Description: Joi.string().required(),
            banner2Image: Joi.string().required(),
            banner2ImageURL: Joi.string().optional(),
            banner2Link: Joi.string().required(),
            banner2Title: Joi.string().required(),
            banner2Description: Joi.string().required(),
            banner3Image: Joi.string().required(),
            banner3ImageURL: Joi.string().optional(),
            banner3Link: Joi.string().required(),
            banner3Title: Joi.string().required(),
            banner3Description: Joi.string().required()
        });

        const { error } = schema.validate(req.body);
        if (error) {
            throw new Error(error.details[0].message);
        }

        const result = await bannerCtrl.saveBanner(req.body, req.body.bannerId, req.userDetails);
        logger.info(constants.LOGGER_TYPE_ROUTE, __file, '/saveBanner', '', '', `Banner saved successfully - ${JSON.stringify(result)}`);
        common.sendResponse(req, res, true, constants.SUCCESS_STATUS_200, `Banner saved successfully`, result);
    } catch (error) {
        logger.error(constants.LOGGER_TYPE_ROUTE, __file, '/saveBanner', '', '', `Banner save failed`, error);
        common.sendResponse(req, res, false, error.statusCode || constants.ERROR_STATUS_400, error.message || 'Failed to save banner', error);
    }
});

const formatResult = (result) => {
    return result.map(banner => ({
        id: banner.id,
        banner1Image: banner.banner1Image,
        banner1ImageURL: `${config.BASE_URL}/upload/getFileFromCloud?key=${banner.banner1Image}`,
        banner1Link: banner.banner1Link,
        banner1Title: banner.banner1Title,
        banner1Description: banner.banner1Description,
        banner2Image: banner.banner2Image,
        banner2ImageURL: `${config.BASE_URL}/upload/getFileFromCloud?key=${banner.banner2Image}`,
        banner2Link: banner.banner2Link,
        banner2Title: banner.banner2Title,
        banner2Description: banner.banner2Description,
        banner3Image: banner.banner3Image,
        banner3ImageURL: `${config.BASE_URL}/upload/getFileFromCloud?key=${banner.banner3Image}`,
        banner3Link: banner.banner3Link,
        banner3Title: banner.banner3Title,
        banner3Description: banner.banner3Description
    }));
};

module.exports = router;
