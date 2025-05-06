/* eslint-disable no-console */
const ip = require('ip');
const util = require('util');
const winston = require('winston');

const serverIP = ip.address();
// eslint-disable-next-line new-cap
const logger = new winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf((args) => {
            const timestamp = args.timestamp.trim();
            const { level } = args;
            const message = args.message || '';
            const splatArgs = args[Symbol.for('splat')];
            const strArgs = (splatArgs || []).map((arg) => util.inspect(arg)).join(' ');
            const str = `[${timestamp}] [${serverIP}] [${level.toUpperCase()}] ${message} ${strArgs}`;
            console.log(str);
            return str;
        }),
    ),
    transports: [
        new winston.transports.Console({
            timestamp: true,
            colorize: true,
        }),
    ],
});

logger.add(new winston.transports.File({ filename: 'log/access.log', level: 'info' }));

// console.log = (...args) => logger.info.call(logger, ...args);
// console.info = (...args) => logger.info.call(logger, ...args);
// console.warn = (...args) => logger.warn.call(logger, ...args);
// console.error = (...args) => logger.error.call(logger, ...args);
// console.debug = (...args) => logger.debug.call(logger, ...args);

const info = (message) => {
    if (typeof message === 'string') {
        logger.log('info', message);
    } else {
        logger.log('info', ...message);
    }
};

const warn = (message) => {
    if (typeof message === 'string') {
        logger.log('warn', message);
    } else {
        logger.log('warn', ...message);
    }
};

const error = (message, error = '') => {
    if (typeof message === 'string') {
        logger.log('error', message, error);
    } else {
        logger.log('error', ...message, error);
    }
};

module.exports = {
    winstonLogger: {
        error,
        warn,
        info,
    },
};
