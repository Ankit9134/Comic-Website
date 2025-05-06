/* eslint-disable no-console */
/* eslint-disable prefer-destructuring */
const { winstonLogger } = require('./winstonLogger.js');
const path = require('path');

const formatMessage = (
    type, //app, route, controller, model, lib, script, other
    filename, // filename with path
    functionName,
    ip,
    userid,
    message,
) => `[TYPE: ${type}] [FILE: ${filename}] [FUNCTION: ${functionName}] [IP: ${ip}] [USERID: ${userid}] [MESSAGE: ${message}]`;

const info = (...args) => {
    let message = '';
    if (args.length >= 6) {
        message = formatMessage(args[0], args[1], args[2], args[3], args[4], args[5]);
    } else {
        message = args[0];
    }
    winstonLogger.info(message);
};

const warn = (...args) => {
    let message = '';
    if (args.length >= 6) {
        message = formatMessage(args[0], args[1], args[2], args[3], args[4], args[5]);
    } else {
        message = args[0];
    }
    winstonLogger.warn(message);
};

const error = (...args) => {
    let message = '';
    let error = '';
    if (args.length >= 6) {
        message = formatMessage(args[0], args[1], args[2], args[3], args[4], args[5]);
        error = args[6];
    } else {
        message = args[0];
        error = args[1];
    }
    winstonLogger.error(message, error);
};

Object.defineProperty(global, '__stack', {
    get: function () {
        let orig = Error.prepareStackTrace;

        Error.prepareStackTrace = function (_, stack) {
            return stack;
        };
        let error = new Error();

        Error.captureStackTrace(error, arguments.callee);
        let stack = error.stack;

        Error.prepareStackTrace = orig;
        return stack;
    },
});

Object.defineProperty(global, '__root', {
    get: function () {
        return path.resolve(__dirname, '../..');
    },
});

Object.defineProperty(global, '__module', {
    get: function () {
        let filename = __stack[1].getFileName();
        filename = filename.replace(__root, '');
        filename = path.resolve(filename, '..');
        let module_name = filename.split('/');

        if (module_name.length > 2 && module_name[module_name.length - 1] !== '') {
            let appModule = module_name[module_name.length - 1];

            appModule = appModule.toUpperCase();
            return `[${appModule}]`;
        }
        return '';
    },
});

Object.defineProperty(global, '__line', {
    get: function () {
        return `[${__stack[1].getLineNumber()}]`;
    },
});

Object.defineProperty(global, '__function', {
    get: function () {
        return __stack[1].getFunctionName();
    },
});

Object.defineProperty(global, '__file', {
    get: function () {
        let filename = __stack[1].getFileName();
        filename = filename.replace(__root, '');
        return `${filename}`;
    },
});

module.exports = {
    logger: { error, warn, info },
    __file,
    // error, warn, info ,
};
