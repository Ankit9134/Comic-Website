const { logger } = require('../lib/logger');
const constants = require('../config/constants');
const common = require('../lib/commonFunctions');
const {
    ValidationError,
    AuthenticationError,
    AuthorizationError,
    NotFoundError,
    DatabaseError,
    FileUploadError,
    RateLimitError,
    ExternalServiceError
} = require('../lib/errors');

const errorHandler = (err, req, res, next) => {
    // Log the error with appropriate level and details
    if (err instanceof ValidationError) {
        logger.warn(constants.LOGGER_TYPE_MIDDLEWARE, __file, 'errorHandler', '', '',
            `Validation error: ${err.message}`, err.details);
    } else if (err instanceof AuthenticationError) {
        logger.warn(constants.LOGGER_TYPE_MIDDLEWARE, __file, 'errorHandler', '', '',
            `Authentication error: ${err.message}`, err.details);
    } else if (err instanceof AuthorizationError) {
        logger.warn(constants.LOGGER_TYPE_MIDDLEWARE, __file, 'errorHandler', '', '',
            `Authorization error: ${err.message}`, err.details);
    } else if (err instanceof NotFoundError) {
        logger.warn(constants.LOGGER_TYPE_MIDDLEWARE, __file, 'errorHandler', '', '',
            `Not found error: ${err.message}`, err.details);
    } else {
        logger.error(constants.LOGGER_TYPE_MIDDLEWARE, __file, 'errorHandler', '', '',
            `Unexpected error: ${err.message}`, err);
    }

    // Send appropriate response based on error type
    if (err instanceof ValidationError) {
        common.sendResponse(req, res, false, err.statusCode, err.message, {
            code: err.code,
            details: err.details,
            timestamp: err.timestamp
        });
    } else if (err instanceof AuthenticationError) {
        common.sendResponse(req, res, false, err.statusCode, err.message, {
            code: err.code,
            details: err.details,
            timestamp: err.timestamp
        });
    } else if (err instanceof AuthorizationError) {
        common.sendResponse(req, res, false, err.statusCode, err.message, {
            code: err.code,
            details: err.details,
            timestamp: err.timestamp
        });
    } else if (err instanceof NotFoundError) {
        common.sendResponse(req, res, false, err.statusCode, err.message, {
            code: err.code,
            details: err.details,
            timestamp: err.timestamp
        });
    } else if (err instanceof DatabaseError) {
        common.sendResponse(req, res, false, err.statusCode, 'Database operation failed', {
            code: err.code,
            details: err.details,
            timestamp: err.timestamp
        });
    } else if (err instanceof FileUploadError) {
        common.sendResponse(req, res, false, err.statusCode, err.message, {
            code: err.code,
            details: err.details,
            timestamp: err.timestamp
        });
    } else if (err instanceof RateLimitError) {
        common.sendResponse(req, res, false, err.statusCode, err.message, {
            code: err.code,
            details: err.details,
            timestamp: err.timestamp
        });
    } else if (err instanceof ExternalServiceError) {
        common.sendResponse(req, res, false, err.statusCode, err.message, {
            code: err.code,
            details: err.details,
            timestamp: err.timestamp
        });
    } else {
        // Handle unexpected errors
        common.sendResponse(req, res, false, constants.ERROR_STATUS_500, 'Internal server error', {
            code: 'INTERNAL_SERVER_ERROR',
            message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred',
            timestamp: new Date().toISOString()
        });
    }
};

module.exports = errorHandler;