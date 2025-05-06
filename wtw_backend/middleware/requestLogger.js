const { logger } = require('../lib/logger');
const constants = require('../config/constants');

const requestLogger = (req, res, next) => {
    // Log request details
    logger.info(constants.LOGGER_TYPE_MIDDLEWARE, __file, 'requestLogger', '', '',
        `Incoming ${req.method} request to ${req.originalUrl}`, {
        method: req.method,
        url: req.originalUrl,
        query: req.query,
        body: req.method !== 'GET' ? req.body : undefined,
        headers: {
            'content-type': req.headers['content-type'],
            'user-agent': req.headers['user-agent'],
            'ip': req.ip
        }
    });

    // Log response details
    const originalSend = res.send;
    res.send = function (data) {
        logger.info(constants.LOGGER_TYPE_MIDDLEWARE, __file, 'requestLogger', '', '',
            `Outgoing response for ${req.method} ${req.originalUrl}`, {
            statusCode: res.statusCode,
            responseTime: Date.now() - req._startTime,
            data: data
        });
        return originalSend.apply(res, arguments);
    };

    // Add start time to request
    req._startTime = Date.now();
    next();
};

module.exports = requestLogger;