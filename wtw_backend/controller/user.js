const db = require('../models');
const crypto = require('../lib/crypto');

const getAll = () => new Promise((resolve, reject) => {
    db.user.findAll()
        .then(resolve)
        .catch(reject);
});

const login = async (username, password) => new Promise(async (resolve, reject) => {
    db.user.findOne({
        attributes: ['id', 'firstName', 'lastName', 'email', 'userType'],
        limit: 1,
        where: { username, password },
        order: [['createdAt', 'DESC']]
    }).then(async (user) => {
        if (user && user.id) {
            const token = await crypto.encrypt({ userId: user.id });
            const decryptedData = await crypto.decrypt(token);
            const updatedUser = await db.user.update({ activeSession: token }, { where: { id: user.id } });
            resolve({ user, token, decryptedData, updatedUser });
        } else {
            reject(new Error('Invalid username or password'));
        }
    }).catch((error) => {
        reject(error);
    });
});

const getByUserId = (userId) => new Promise((resolve, reject) => {
    db.user.findOne({
        attributes: ['id', 'firstName', 'lastName', 'email', 'userType'],
        limit: 1,
        where: { id: userId },
        order: [['createdAt', 'DESC']]
    })
        .then(resolve)
        .catch(reject);
});

const getBySessionId = (sessionId) => new Promise((resolve, reject) => {
    db.user.findOne({
        attributes: ['id', 'firstName', 'lastName', 'email', 'userType', 'activeSession'],
        limit: 1,
        where: { activeSession: sessionId },
        order: [['createdAt', 'DESC']]
    })
        .then((user) => {
            resolve(user);
        })
        .catch(reject);
});

const add = (userObj) => new Promise((resolve, reject) => {
    db.user.create(userObj)
        .then(resolve)
        .catch(reject);
});

const logout = (sessionId) => new Promise((resolve, reject) => {
    db.user.update({ activeSession: null }, { where: { activeSession: sessionId } })
        .then(resolve)
        .catch(reject);
});

module.exports = {
    getAll,
    login,
    add,
    getByUserId,
    getBySessionId,
    logout
}
