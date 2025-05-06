const express = require('express');
const router = express.Router();
const Joi = require('joi');
const _ = require('lodash');
const constants = require('../config/constants');
const common = require('../lib/commonFunctions');
const { logger } = require('../lib/logger');
const { getAudioDurationInSeconds } = require('get-audio-duration');
const auth = require('../middleware/auth');
const s3Upload = require('../lib/s3Upload');
const { NotFoundError, FileUploadError } = require('../lib/errors');


const generateResponseObject = async (fileType, file) => {
    if (fileType === constants.FILE_TYPE_IMAGE) {
        return {
            oldFileName: file.originalname,
            imageFileName: file.key,
            fileType: fileType,
            imageURL: common.createS3AccessURL(file.key),
            // S3URL: file.location,
        }
    } else if (fileType === constants.FILE_TYPE_AUDIO) {
        const url = await s3Upload.getPreSignedURL(file.key);
        const length = await getAudioDurationInSeconds(url);
        return {
            oldFileName: file.originalname,
            audioFileName: file.key,
            fileType: fileType,
            audioURL: common.createS3AccessURL(file.key),
            // S3URL: file.location,
            length: Math.round(length),
        };
    }
};

router.post('/uploadFile', auth.validateAdminAccessToken, s3Upload.uploadImageOnCloud.single('file'), async (req, res) => {
    const schema = Joi.object({
        fileType: Joi.string().valid(constants.FILE_TYPE_IMAGE, constants.FILE_TYPE_AUDIO).required()
    });

    schema.validateAsync(req.body)
        .then(async () => {
            try {
                if (!req.file) {
                    throw new FileUploadError('No file uploaded');
                }

                let result;
                if (req.body.fileType === constants.FILE_TYPE_IMAGE || req.body.fileType === constants.FILE_TYPE_AUDIO) {
                    result = await generateResponseObject(req.body.fileType, req.file);
                } else {
                    throw new Error('Invalid file type');
                }

                logger.info(constants.LOGGER_TYPE_ROUTE, __file, '/uploadFile', '', '', `File uploaded successfully`);
                common.sendResponse(req, res, true, constants.SUCCESS_STATUS_200, `File uploaded successfully`, result);
            } catch (error) {
                if (error instanceof FileUploadError) {
                    logger.warn(constants.LOGGER_TYPE_ROUTE, __file, '/uploadFile', '', '', `File upload error: ${error.message}`);
                    common.sendResponse(req, res, false, error.statusCode, error.message, error);
                } else {
                    logger.error(constants.LOGGER_TYPE_ROUTE, __file, '/uploadFile', '', '', `File upload failed`, error);
                    common.sendResponse(req, res, false, error.statusCode || constants.ERROR_STATUS_400, error.message || 'Failed to upload file', error);
                }
            }
        })
        .catch((error) => {
            logger.error(constants.LOGGER_TYPE_ROUTE, __file, '/uploadFile', '', '', `User validation failed`, error);
            common.sendResponse(req, res, false, constants.ERROR_STATUS_VFAIL, _.get(error, 'message', 'User validation failed'), error);
        })
});

router.post('/uploadFileArray', auth.validateAdminAccessToken, s3Upload.uploadImageOnCloud.array('file'), async (req, res) => {
    const schema = Joi.object({
        fileType: Joi.string().valid(constants.FILE_TYPE_IMAGE, constants.FILE_TYPE_AUDIO).required()
    });

    schema.validateAsync(req.body)
        .then(async () => {
            try {
                if (!req.files || req.files.length === 0) {
                    throw new FileUploadError('No file uploaded');
                }

                let result;
                if (req.body.fileType === constants.FILE_TYPE_IMAGE || req.body.fileType === constants.FILE_TYPE_AUDIO) {
                    result = await Promise.all(req.files.map(async (file) => await generateResponseObject(req.body.fileType, file)));
                } else {
                    throw new Error('Invalid file type');
                }

                logger.info(constants.LOGGER_TYPE_ROUTE, __file, '/uploadFile', '', '', `File uploaded successfully`);
                common.sendResponse(req, res, true, constants.SUCCESS_STATUS_200, `File uploaded successfully`, result);
            } catch (error) {
                if (error instanceof FileUploadError) {
                    logger.warn(constants.LOGGER_TYPE_ROUTE, __file, '/uploadFile', '', '', `File upload error: ${error.message}`);
                    common.sendResponse(req, res, false, error.statusCode, error.message, error);
                } else {
                    logger.error(constants.LOGGER_TYPE_ROUTE, __file, '/uploadFile', '', '', `File upload failed`, error);
                    common.sendResponse(req, res, false, error.statusCode || constants.ERROR_STATUS_400, error.message || 'Failed to upload file', error);
                }
            }
        })
        .catch((error) => {
            logger.error(constants.LOGGER_TYPE_ROUTE, __file, '/uploadFile', '', '', `User validation failed`, error);
            common.sendResponse(req, res, false, constants.ERROR_STATUS_VFAIL, _.get(error, 'message', 'User validation failed'), error);
        })
});

router.get('/getFileFromCloud', (req, res) => {
    try {
        const key = req.query.key;
        logger.info(constants.LOGGER_TYPE_ROUTE, __file, '/getFileFromCloud', '', '', `Trying to fetch file from cloud - ${key}`);
        const fileStream = s3Upload.getObject(key);
        fileStream.on('error', (err) => {
            if (!res.headersSent) {
                res.setHeader('Content-Type', 'application/json');
                if (err instanceof FileUploadError) {
                    logger.warn(constants.LOGGER_TYPE_ROUTE, __file, '/getFileFromCloud', '', '', `File upload error: ${err.message}`);
                    common.sendResponse(req, res, false, err.statusCode, err.message, err);
                } else {
                    logger.error(constants.LOGGER_TYPE_ROUTE, __file, '/getFileFromCloud', '', '', `File upload failed`, err);
                    common.sendResponse(req, res, false, err.statusCode || constants.ERROR_STATUS_400, err.message || 'Failed to upload file', err);
                }
            } else {
                // Headers already sent, just destroy the response
                logger.error(constants.LOGGER_TYPE_ROUTE, __file, '/getFileFromCloud', '', '', `Headers already sent, cannot send error response`, err);
                res.destroy();
            }
        });
        res.attachment(key);
        fileStream.pipe(res);
    } catch (error) {
        logger.error(constants.LOGGER_TYPE_ROUTE, __file, '/getFileFromCloud', '', '', `Error occurred while fetching file from cloud`, error);
        common.sendResponse(req, res, false, constants.ERROR_STATUS_400, _.get(error, 'message', 'Error occurred while fetching file from cloud'), error);
    }
});

router.get('/getPreSignedURL', (req, res) => {
    try {
        const key = req.query.key;
        logger.info(constants.LOGGER_TYPE_ROUTE, __file, '/getPreSignedURL', '', '', `Trying to fetch file from cloud - ${key}`);
        s3Upload.getPreSignedURL(key).then((url) => {
            logger.info(constants.LOGGER_TYPE_ROUTE, __file, '/getPreSignedURL', '', '', `Pre-signed URL fetched successfully`, url);
            common.sendResponse(req, res, true, constants.SUCCESS_STATUS_200, `Pre-signed URL fetched successfully`, url);
        }).catch((error) => {
            logger.error(constants.LOGGER_TYPE_ROUTE, __file, '/getPreSignedURL', '', '', `Error occurred while fetching file from cloud`, error);
            common.sendResponse(req, res, false, constants.ERROR_STATUS_400, _.get(error, 'message', 'Error occurred while fetching file from cloud'), error);
        });
    } catch (error) {
        logger.error(constants.LOGGER_TYPE_ROUTE, __file, '/getPreSignedURL', '', '', `Error occurred while fetching file from cloud`, error);
        common.sendResponse(req, res, false, constants.ERROR_STATUS_400, _.get(error, 'message', 'Error occurred while fetching file from cloud'), error);
    }
});

module.exports = router;
