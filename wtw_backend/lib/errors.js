const constants = require('../config/constants');

class AppError extends Error {
    constructor(message, code, statusCode = constants.ERROR_STATUS_400) {
        super(message);
        this.name = this.constructor.name;
        this.code = code;
        this.statusCode = statusCode;
        this.timestamp = new Date().toISOString();
    }
}

class ValidationError extends AppError {
    constructor(message, details = null) {
        super(message, 'VALIDATION_ERROR', constants.ERROR_STATUS_400);
        this.details = details;
    }
}

class AuthenticationError extends AppError {
    constructor(message, details = null) {
        super(message, 'AUTHENTICATION_ERROR', constants.ERROR_STATUS_401);
        this.details = details;
    }
}

class AuthorizationError extends AppError {
    constructor(message, details = null) {
        super(message, 'AUTHORIZATION_ERROR', constants.ERROR_STATUS_403);
        this.details = details;
    }
}

class NotFoundError extends AppError {
    constructor(message, details = null) {
        super(message, 'NOT_FOUND_ERROR', constants.ERROR_STATUS_404);
        this.details = details;
    }
}

class DatabaseError extends AppError {
    constructor(message, details = null) {
        super(message, 'DATABASE_ERROR', constants.ERROR_STATUS_500);
        this.details = details;
    }
}

class FileUploadError extends AppError {
    constructor(message, details = null) {
        super(message, 'FILE_UPLOAD_ERROR', constants.ERROR_STATUS_400);
        this.details = details;
    }
}

class RateLimitError extends AppError {
    constructor(message, details = null) {
        super(message, 'RATE_LIMIT_ERROR', constants.ERROR_STATUS_429);
        this.details = details;
    }
}

class ExternalServiceError extends AppError {
    constructor(message, details = null) {
        super(message, 'EXTERNAL_SERVICE_ERROR', constants.ERROR_STATUS_502);
        this.details = details;
    }
}

module.exports = {
    AppError,
    ValidationError,
    AuthenticationError,
    AuthorizationError,
    NotFoundError,
    DatabaseError,
    FileUploadError,
    RateLimitError,
    ExternalServiceError
};