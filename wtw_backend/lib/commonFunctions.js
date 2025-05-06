const config = require('../config');
const _ = require('lodash');
const constants = require('../config/constants');

const sendResponse = (req, res, success = true, statusCode = 200, message = '', data = null) => {
    let response = {
        statusCode,
        status: success,
        message: message || (success ? 'Success' : 'Failed'),
    };

    if (success) {
        response.data = data;
    } else {
        // Handle different types of errors
        let errorData = data;
        if (data instanceof Error) {
            errorData = {
                code: data.code || 'INTERNAL_SERVER_ERROR',
                message: data.message || 'An unexpected error occurred',
                details: data.details || null
            };
        } else if (typeof data === 'string') {
            errorData = {
                code: 'VALIDATION_ERROR',
                message: data,
                details: null
            };
        } else if (!data) {
            errorData = {
                code: 'UNKNOWN_ERROR',
                message: 'An unexpected error occurred',
                details: null
            };
        }
        response.error = errorData;
    }

    res.status(statusCode).send(response);
};

const replaceAndAddS3URL = (url) => {
    return _.replace(url, config.AWS_S3_BUCKET_URL, `${config.BASE_URL}${constants.CLOUD_FILE_DOWNLOAD_URL}`);
};

const createS3AccessURL = (key) => {
    return `${config.BASE_URL}${constants.CLOUD_FILE_DOWNLOAD_URL}?key=${key}`;
};

module.exports = {
    sendResponse,
    replaceAndAddS3URL,
    createS3AccessURL,
};
