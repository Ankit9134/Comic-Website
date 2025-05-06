const express = require('express');
const router = express.Router();
const Joi = require('joi');
const userCtrl = require('../controller/user');
const constants = require('../config/constants');
const common = require('../lib/commonFunctions');
const { logger } = require('../lib/logger');
const { AuthenticationError } = require('../lib/errors');
const auth = require('../middleware/auth');

router.get('/getAllUsers', async (req, res) => {
    try {
        const result = await userCtrl.getAll();
        logger.info(constants.LOGGER_TYPE_ROUTE, __file, '/getAllUsers', '', '', `Users fetched successfully`);
        common.sendResponse(req, res, true, constants.SUCCESS_STATUS_200, `All users fetched`, result);
    } catch (error) {
        logger.error(constants.LOGGER_TYPE_ROUTE, __file, '/getAllUsers', '', '', `User fetch failed`, error);
        common.sendResponse(req, res, false, error.statusCode || constants.ERROR_STATUS_400, error.message || 'Failed to fetch users', error);
    }
});

router.post('/addNewUser', async (req, res) => {
    try {
        const schema = Joi.object({
            firstName: Joi.string().required(),
            lastName: Joi.string().required(),
            email: Joi.string().email().required(),
            username: Joi.string().required(),
            password: Joi.string().min(6).required(),
            userType: Joi.string().valid(constants.USER_TYPE_ADMIN, constants.USER_TYPE_CUSTOMER).required()
        });

        const { error } = schema.validate(req.body);
        if (error) {
            throw new Error(error.details[0].message);
        }

        const result = await userCtrl.add(req.body);
        logger.info(constants.LOGGER_TYPE_ROUTE, __file, '/addNewUser', '', '', `User created successfully - ${JSON.stringify(result)}`);
        common.sendResponse(req, res, true, constants.SUCCESS_STATUS_200, `New user has been created`, result);
    } catch (error) {
        logger.error(constants.LOGGER_TYPE_ROUTE, __file, '/addNewUser', '', '', `User creation failed`, error);
        common.sendResponse(req, res, false, error.statusCode || constants.ERROR_STATUS_400, error.message || 'Failed to create user', error);
    }
});

router.post('/login', async (req, res) => {
    try {
        const schema = Joi.object({
            username: Joi.string().required(),
            password: Joi.string().required()
        });

        const { error } = schema.validate(req.body);
        if (error) {
            throw new Error(error.details[0].message);
        }

        const result = await userCtrl.login(req.body.username, req.body.password);
        logger.info(constants.LOGGER_TYPE_ROUTE, __file, '/login', '', '', `User logged in successfully`);
        common.sendResponse(req, res, true, constants.SUCCESS_STATUS_200, `User logged in successfully`, result);
    } catch (error) {
        if (error instanceof AuthenticationError) {
            logger.warn(constants.LOGGER_TYPE_ROUTE, __file, '/login', '', '', `Authentication failed: ${error.message}`);
            common.sendResponse(req, res, false, error.statusCode, error.message, error);
        } else {
            logger.error(constants.LOGGER_TYPE_ROUTE, __file, '/login', '', '', `Login failed`, error);
            common.sendResponse(req, res, false, error.statusCode || constants.ERROR_STATUS_400, error.message || 'Failed to login', error);
        }
    }
});

router.get('/logout', auth.validateAdminAccessToken, async (req, res) => {
    try {
        await userCtrl.logout(req.userDetails.activeSession);
        logger.info(constants.LOGGER_TYPE_ROUTE, __file, '/logout', '', '', `User logged out successfully`);
        common.sendResponse(req, res, true, constants.SUCCESS_STATUS_200, `User logged out successfully`);
    } catch (error) {
        if (error instanceof AuthenticationError) {
            logger.warn(constants.LOGGER_TYPE_ROUTE, __file, '/logout', '', '', `Authentication failed: ${error.message}`);
            common.sendResponse(req, res, false, error.statusCode, error.message, error);
        } else {
            logger.error(constants.LOGGER_TYPE_ROUTE, __file, '/logout', '', '', `Logout failed`, error);
            common.sendResponse(req, res, false, error.statusCode || constants.ERROR_STATUS_400, error.message || 'Failed to logout', error);
        }
    }
});

module.exports = router;
