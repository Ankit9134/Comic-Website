const Joi = require('joi');
const { ValidationError } = require('../lib/errors');
const { logger } = require('../lib/logger');
const constants = require('../config/constants');

const validateRequest = (schema, source = 'body') => {
    return async (req, res, next) => {
        try {
            const value = await schema.validateAsync(req[source], {
                abortEarly: false,
                stripUnknown: true
            });
            req[source] = value;
            next();
        } catch (error) {
            if (error instanceof Joi.ValidationError) {
                const validationErrors = error.details.map(detail => ({
                    field: detail.path.join('.'),
                    message: detail.message
                }));

                logger.warn(constants.LOGGER_TYPE_MIDDLEWARE, __file, 'validateRequest', '', '',
                    `Validation failed: ${JSON.stringify(validationErrors)}`);

                next(new ValidationError('Validation failed', validationErrors));
            } else {
                next(error);
            }
        }
    };
};

// Common validation schemas
const schemas = {
    pagination: Joi.object({
        page: Joi.number().min(0).default(0).messages({
            'number.base': 'Page must be a number',
            'number.min': 'Page must be 0 or greater'
        }),
        limit: Joi.number().min(1).default(10).messages({
            'number.base': 'Limit must be a number',
            'number.min': 'Limit must be 1 or greater'
        })
    }),

    idParam: Joi.object({
        id: Joi.number().required().messages({
            'number.base': 'ID must be a number',
            'any.required': 'ID is required'
        })
    }),

    user: {
        create: Joi.object({
            firstName: Joi.string().required().messages({
                'string.empty': 'First name is required',
                'any.required': 'First name is required'
            }),
            lastName: Joi.string().required().messages({
                'string.empty': 'Last name is required',
                'any.required': 'Last name is required'
            }),
            email: Joi.string().email().required().messages({
                'string.email': 'Invalid email format',
                'string.empty': 'Email is required',
                'any.required': 'Email is required'
            }),
            userType: Joi.string().valid(constants.USER_TYPE_ADMIN, constants.USER_TYPE_CUSTOMER).required().messages({
                'any.only': 'Invalid user type',
                'any.required': 'User type is required'
            }),
            username: Joi.string().required().messages({
                'string.empty': 'Username is required',
                'any.required': 'Username is required'
            }),
            password: Joi.string().min(6).required().messages({
                'string.min': 'Password must be at least 6 characters long',
                'string.empty': 'Password is required',
                'any.required': 'Password is required'
            })
        }),

        login: Joi.object({
            username: Joi.string().required().messages({
                'string.empty': 'Username is required',
                'any.required': 'Username is required'
            }),
            password: Joi.string().required().messages({
                'string.empty': 'Password is required',
                'any.required': 'Password is required'
            })
        })
    },

    comic: {
        create: Joi.object({
            comicName: Joi.string().required().messages({
                'string.empty': 'Comic name is required',
                'any.required': 'Comic name is required'
            }),
            description: Joi.string().required().messages({
                'string.empty': 'Description is required',
                'any.required': 'Description is required'
            }),
            genreId: Joi.number().required().messages({
                'number.base': 'Genre ID must be a number',
                'any.required': 'Genre ID is required'
            }),
            comicContent: Joi.array().required().min(1).messages({
                'array.base': 'Comic content must be an array',
                'array.min': 'Comic content cannot be empty',
                'any.required': 'Comic content is required'
            })
        })
    },

    banner: {
        save: Joi.object({
            id: Joi.number().required().messages({
                'number.base': 'ID must be a number',
                'any.required': 'ID is required'
            }),
            banner1Image: Joi.string().required().messages({
                'string.empty': 'Banner 1 image is required',
                'any.required': 'Banner 1 image is required'
            }),
            banner1Link: Joi.string().required().messages({
                'string.empty': 'Banner 1 link is required',
                'any.required': 'Banner 1 link is required'
            }),
            banner2Image: Joi.string().required().messages({
                'string.empty': 'Banner 2 image is required',
                'any.required': 'Banner 2 image is required'
            }),
            banner2Link: Joi.string().required().messages({
                'string.empty': 'Banner 2 link is required',
                'any.required': 'Banner 2 link is required'
            }),
            banner3Image: Joi.string().required().messages({
                'string.empty': 'Banner 3 image is required',
                'any.required': 'Banner 3 image is required'
            }),
            banner3Link: Joi.string().required().messages({
                'string.empty': 'Banner 3 link is required',
                'any.required': 'Banner 3 link is required'
            })
        })
    }
};

module.exports = {
    validateRequest,
    schemas
};