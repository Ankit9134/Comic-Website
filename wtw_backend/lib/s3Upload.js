const _ = require('lodash');
const config = require('../config');
const constants = require('../config/constants');
const { logger } = require('../lib/logger');
const multer = require('multer');
const path = require('path');
const AWS = require('aws-sdk');
const multerS3 = require('multer-s3');
const { S3Client } = require('@aws-sdk/client-s3');

const LOCAL_FOLDER_PATH = config.LOCAL_FOLDER_PATH;
const AWS_S3_BUCKETNAME = config.AWS_S3_BUCKETNAME;

// const s3 = new S3Client({
//     // const s3 = new AWS.S3({
//     region: config.AWS_S3_REGION,
//     credentials: {
//         accessKeyId: config.AWS_S3_ACCESS_KEY_ID,
//         secretAccessKey: config.AWS_S3_SECRET_ACCESS_KEY,
//     },
//     sslEnabled: false,
//     s3ForcePathStyle: true,
//     signatureVersion: 'v4',
// });

const uploadFileOnMachine = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, LOCAL_FOLDER_PATH);
        },
        filename: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            const newFileName = file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname);
            cb(null, newFileName);
        },
    }),
});

const createS3Client = () => {
    return new AWS.S3({
        region: config.AWS_S3_REGION,
        credentials: {
            accessKeyId: config.AWS_S3_ACCESS_KEY_ID,
            secretAccessKey: config.AWS_S3_SECRET_ACCESS_KEY,
        },
        sslEnabled: false,
        s3ForcePathStyle: true,
        signatureVersion: 'v4',
    });
};

const createMulterS3Client = () => {
    return new S3Client({
        region: config.AWS_S3_REGION,
        credentials: {
            accessKeyId: config.AWS_S3_ACCESS_KEY_ID,
            secretAccessKey: config.AWS_S3_SECRET_ACCESS_KEY,
        },
        sslEnabled: false,
        s3ForcePathStyle: true,
        signatureVersion: 'v4',
    });
};

const uploadImageOnCloud = multer({
    storage: multerS3({
        s3: createMulterS3Client(),
        bucket: AWS_S3_BUCKETNAME,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key: function (req, file, callback) {
            logger.info(constants.LOGGER_TYPE_LIB, __file, '/uploadImageOnCloud', '', '', `Inside key function`);
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            const newFileName = file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname);
            callback(null, newFileName);
        },
        metadata: function (req, file, cb) {
            logger.info(constants.LOGGER_TYPE_LIB, __file, '/uploadImageOnCloud', '', '', `Inside metadata function`);
            const ext = path.extname(file.originalname);
            cb(null, { fieldName: file.fieldname, extension: ext });
        },
    }),
    fileFilter: function (req, file, callback) {
        const ext = path.extname(file.originalname);
        if (!config.ALLOWED_FILE_TYPES.includes(ext)) {
            return callback(new Error(`Invalid file type - ${ext}`));
        }
        callback(null, true);
    },
    limits: {
        fileSize: 10 * 1024 * 1024,
    },
});

const getObject = (key) => {
    const options = {
        Bucket: AWS_S3_BUCKETNAME,
        Key: key,
    };
    return createS3Client().getObject(options).createReadStream();
};

const getPreSignedURL = (key, expiry = 500) =>
    new Promise((resolve, reject) => {
        try {
            const url = createS3Client().getSignedUrl('getObject', {
                Bucket: AWS_S3_BUCKETNAME,
                Key: key,
                Expires: expiry,
            });
            resolve(url);
        } catch (error) {
            reject(error);
        }
    });

module.exports = {
    uploadFileOnMachine,
    uploadImageOnCloud,
    getObject,
    getPreSignedURL,
};
