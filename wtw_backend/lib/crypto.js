const cryptoJS = require("crypto-js");
const constants = require("../config/constants");

const encrypt = (data) => new Promise((resolve, reject) => {
    try {
        // resolve(cryptoJS.AES.encrypt(JSON.stringify(data), constants.ENCRYPT_PRIVATE_KEY).toString());
        resolve(generateShortToken(data));
    } catch (error) {
        reject(error);
    }
});

const decrypt = (data) => new Promise((resolve, reject) => {
    try {
        // let bytes = cryptoJS.AES.decrypt(data, constants.ENCRYPT_PRIVATE_KEY);
        // let decryptedData = JSON.parse(bytes.toString(cryptoJS.enc.Utf8));
        let decryptedData = decryptShortToken(data);
        resolve(decryptedData);
    } catch (error) {
        reject(error);
    }
});

const generateShortToken = (data) => new Promise((resolve, reject) => {
    try {
        // Create a simple payload with userId and timestamp
        const payload = {
            data,
            t: Date.now() // short timestamp key
        };

        // Convert to base64 for readability
        const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');

        // Create a simple hash for verification
        const hash = cryptoJS.HmacMD5(base64Payload, constants.ENCRYPT_PRIVATE_KEY)
            .toString()
            .substring(0, 4); // Take first 4 chars of hash

        // Combine payload and hash
        const token = `${base64Payload}.${hash}`;

        resolve(token);
    } catch (error) {
        reject(error);
    }
});

const decryptShortToken = (token) => new Promise((resolve, reject) => {
    try {
        const [base64Payload, hash] = token.split('.');

        // Verify the hash
        const expectedHash = cryptoJS.HmacMD5(base64Payload, constants.ENCRYPT_PRIVATE_KEY)
            .toString()
            .substring(0, 4);

        if (hash !== expectedHash) {
            throw new Error('Invalid token');
        }

        // Decode the payload
        const payload = JSON.parse(Buffer.from(base64Payload, 'base64').toString());
        resolve(payload.data);
    } catch (error) {
        reject(error);
    }
});

module.exports = {
    encrypt,
    decrypt,
    generateShortToken,
    decryptShortToken
};