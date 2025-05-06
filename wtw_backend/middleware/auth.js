const userCtrl = require('../controller/user');
const constants = require('../config/constants');
const { logger } = require('../lib/logger');
const common = require('../lib/commonFunctions');
const _ = require('lodash');


const validateAdminAccessToken = (req, res, next) => {
    logger.info(constants.LOGGER_TYPE_MIDDLEWARE, __file, 'validateAdminAccessToken', '', '', `Validating accessToken for admin - ${req.headers.authorization}`);
    if (req.headers.authorization) {
        const accessToken = req.headers.authorization;
        console.log("accessToken", accessToken);
        userCtrl
            .getBySessionId(accessToken)
            .then((user) => {
                const userDetails = user && user.dataValues ? user.dataValues : false;
                // console.log(userDetails);
                if (userDetails && userDetails.id && userDetails.userType && userDetails.userType === constants.USER_TYPE_ADMIN) {
                    logger.info(constants.LOGGER_TYPE_MIDDLEWARE, __file, 'validateAdminAccessToken', '', '', `Validating accessToken for admin success - ${accessToken}, user - ${JSON.stringify(userDetails)}`);
                    req.userDetails = userDetails;
                    next();
                } else {
                    logger.error(constants.LOGGER_TYPE_MIDDLEWARE, __file, 'validateAdminAccessToken', '', '', `Invalid admin accessToken - ${accessToken}`);
                    common.sendResponse(req, res, false, constants.ERROR_STATUS_UNAUTH, 'You are not authorized');
                }
            })
            .catch((error) => {
                logger.error(constants.LOGGER_TYPE_MIDDLEWARE, __file, 'validateAdminAccessToken', '', '', `Error occurred while validating accessToken for admin - ${accessToken}`, error);
                common.sendResponse(req, res, false, constants.ERROR_STATUS_UNAUTH, _.get(error, 'message', error), error);
            });
    } else {
        logger.error(constants.LOGGER_TYPE_MIDDLEWARE, __file, 'validateAdminAccessToken', '', '', `No authorization header provided`, '');
        common.sendResponse(req, res, false, constants.ERROR_STATUS_UNAUTH, 'You are not authorized');
    }
};

module.exports = {
    validateAdminAccessToken,
};
