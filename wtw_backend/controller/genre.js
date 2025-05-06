const db = require('../models');
const _ = require('lodash');

const getAll = () => new Promise((resolve, reject) => {
    db.genre.findAll()
        .then((genres) => {
            resolve(genres);
        })
        .catch((error) => {
            reject(error);
        });
});

const getByGenreId = (genreId) => new Promise((resolve, reject) => {
    db.genre.findOne({
        attributes: ['id', 'firstName', 'lastName', 'email', 'userType'],
        limit: 1,
        where: { id: genreId },
        order: [['createdAt', 'DESC']]
    }).then((genre) => {
        resolve(genre);
    }).catch((error) => {
        reject(error);
    });
});

const saveGenre = (genreObj, genreId, userDetails = {}) => new Promise((resolve, reject) => {
    if (genreId) {
        const data = {
            genreName: genreObj.genreName,
            updatedBy: _.get(userDetails, 'id', null),
            updatedAt: new Date(),
        }
        db.genre.update(data, { where: { id: genreId } })
            .then(resolve)
            .catch(reject);
    } else {
        const data = {
            genreName: genreObj.genreName,
            createdBy: _.get(userDetails, 'id', null),
            createdAt: new Date(),
        }
        db.genre.create(data)
            .then(resolve)
            .catch(reject);
    }
});

module.exports = {
    getAll,
    saveGenre,
    getByGenreId,
}
