const { options } = require('joi');
const db = require('../models');
const _ = require('lodash');

const getAll = () => new Promise((resolve, reject) => {
    db.comic.findAll({
        attributes: ['id', 'comicName', 'description', 'genreId']
    })
        .then(resolve)
        .catch(reject);
});

const getPaginatedComics = (page = 1, limit = 10, genreIds = [], search = false, sort = false) => new Promise((resolve, reject) => {
    const offset = Number((page && page > 1) ? (page - 1) * limit : 0);
    const whereClause = {};
    if (genreIds && genreIds.length > 0) {
        whereClause.genreId = { [db.Sequelize.Op.in]: genreIds };
    }
    if (search) {
        whereClause[db.Sequelize.Op.or] = [
            { comicName: { [db.Sequelize.Op.like]: `%${search}%` } },
            { description: { [db.Sequelize.Op.like]: `%${search}%` } }
        ];
    }
    let sortOrder = [['id', 'ASC']];
    if (sort) {
        if (sort === 'newest') {
            sortOrder = [['createdAt', 'DESC'], ['id', 'ASC']];
        } else if (sort === 'oldest') {
            sortOrder = [['createdAt', 'ASC'], ['id', 'ASC']];
        } else {
            sortOrder = [['id', 'ASC']];
        }
    }

    db.comic.findAndCountAll({
        attributes: ['id', 'comicName', 'description', 'genreId', 'createdAt'],
        distinct: true,
        // raw: true,
        where: whereClause,
        offset: (offset > 0) ? (offset) : 0,
        limit: Number(limit),
        include: [{
            model: db.genre,
            attributes: ['id', 'genreName'],
            as: 'genre',
        }, {
            model: db.comic_content_map,
            attributes: ['id', 'imageFileName', 'audioFileName', 'length', 'sceneNumber'],
            as: 'comicContent',
        }],
        order: sortOrder,
    })
        .then((result) => {
            if (result && result.rows && result.rows.length > 0) {
                resolve({
                    totalRows: result.count,
                    currentPage: page,
                    totalPages: Math.ceil(result.count / limit),
                    limit,
                    ...result
                });
            } else {
                reject(new Error("No comics found", {statusCode: 404}));
            }
        })
        .catch(reject);
});

const getAdminDashboardCounts = () => new Promise((resolve, reject) => {
    Promise.all([
        db.comic.count(),
        db.genre.count(),
        db.comic.count({
            where: {
                createdAt: {
                    [db.Sequelize.Op.gte]: new Date(new Date().setHours(new Date().getHours() - 24)),
                },
            },
        }),
        db.comic.count({
            where: {
                updatedAt: {
                    [db.Sequelize.Op.gte]: new Date(new Date().setHours(new Date().getHours() - 24)),
                },
            },
        }),
    ])
        .then(([comicCount, genreCount, newComicsCount, updatedComicsCount]) => {
            resolve({
                comicCount,
                genreCount,
                newComicsCount,
                updatedComicsCount,
            });
        })
});

const saveComicWithContent = (dataObj, comicId = false, userDetails = false) => new Promise((resolve, reject) => {
    saveComic(dataObj, comicId, userDetails)
        .then((comic) => {
            if (comic && comic.id) {
                saveComicContent(dataObj.comicContent, comic.id, userDetails)
                    .then((comicContent) => {
                        resolve({
                            ...comic,
                            comicContent: comicContent,
                        });
                    })
                    .catch(reject);
            } else {
                reject('Comic could not be created/updated');
            }
        })
        .catch(reject);
});

const saveComic = (dataObj, comicId = false, userDetails = false) => new Promise((resolve, reject) => {
    const comicObj = {
        'comicName': dataObj.comicName,
        'description': dataObj.description,
        'genreId': dataObj.genreId,
    };
    if (comicId) {
        comicObj.updatedAt = new Date();
        comicObj.updatedBy = _.get(userDetails, 'id', null);
        db.comic.update(comicObj, {
            where: {
                id: comicId,
            },
        })
            .then(() => {
                resolve(getComicByComicId(comicId));
            })
            .catch(reject);
    } else {
        comicObj.createdAt = new Date();
        comicObj.createdBy = _.get(userDetails, 'id', null);
        db.comic.create(comicObj)
            .then((comic) => {
                resolve(getComicByComicId(comic.id));
            })
            .catch(reject);
    }
});

const saveComicContent = (dataObj, comicId, userDetails = false) => new Promise((resolve, reject) => {
    if (!comicId) {
        reject('Comic Id is either empty or invalid');
    }
    if (dataObj && Array.isArray(dataObj) && dataObj.length > 0) {
        let comicContentArray = [];
        _.forEach(dataObj, (value) => {
            comicContentArray.push({
                comicId,
                imageFileName: value.imageFileName,
                audioFileName: value.audioFileName,
                length: value.length ? value.length : 0,
                sceneNumber: value.sceneNumber,
                createdBy: _.get(userDetails, 'id', null),
                updatedBy: _.get(userDetails, 'id', null),
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        });
        db.comic_content_map.destroy({
            where: { comicId },
        })
            .then(() => {
                db.comic_content_map.bulkCreate(comicContentArray)
                    .then(() => {
                        getComicContentByComicId(comicId)
                            .then(resolve)
                            .catch(reject);
                    })
                    .catch(reject);
            })
            .catch(reject);
    } else {
        reject("Comic content is empty");
    }
});

const getComicDetailByComicId = (comicId) => new Promise((resolve, reject) => {
    if (!comicId) {
        reject('Comic Id is either empty or invalid');
    }
    Promise.all([
        getComicByComicId(comicId),
        getComicContentByComicId(comicId)
    ]).then(([comic, comicContent]) => {
        if (comic && comic.id) {
            resolve({
                ...comic,
                comicContent: comicContent
            });
        } else {
            reject("Comic does not exist");
        }
    }).catch(reject)
});

const getComicByComicId = (comicId) => new Promise((resolve, reject) => {
    if (!comicId) {
        reject('Comic Id is either empty or invalid');
    }
    db.comic.findOne({
        where: { id: comicId },
        attributes: ['id', 'comicName', 'description', 'genreId'],
        include: [{
            model: db.genre,
            attributes: ['id', 'genreName'],
            as: 'genre',
        }],
    })
        .then((comic) => {
            if (comic && comic.dataValues && comic.dataValues.id) {
                resolve(comic.dataValues);
            } else {
                reject("Invalid comic Id or Comic does not exist");
            }
        })
        .catch(reject);
});

const getComicContentByComicId = (comicId) => new Promise((resolve, reject) => {
    if (!comicId) {
        reject('Comic Id is either empty or invalid');
    }
    db.comic_content_map.findAll({
        where: { comicId: comicId },
        attributes: ['id', 'imageFileName', 'audioFileName', 'length', 'sceneNumber'],
    })
        .then(resolve)
        .catch(reject);
});

const deleteComicWithContent = (comicIds = []) => new Promise((resolve, reject) => {
    if (!comicIds && comicIds.length <= 0) {
        reject('Comic Id is either empty or invalid');
    }
    const whereClauseComicId = {};
    const whereClauseId = {};
    if (comicIds && comicIds.length > 0) {
        whereClauseComicId.comicId = { [db.Sequelize.Op.in]: comicIds };
        whereClauseId.id = { [db.Sequelize.Op.in]: comicIds };
    }

    if (comicIds && comicIds.length > 0) {
        db.comic_content_map.destroy({
            where: whereClauseComicId,
        })
            .then(() => {
                db.comic.destroy({
                    where: whereClauseId,
                })
                    .then(resolve)
                    .catch(reject);
            })
            .catch(reject);
    } else {
        reject("Invalid comic Id or Comic does not exist");
    }
});

const add = (comicObj) => new Promise((resolve, reject) => {
    db.comic.create(comicObj)
        .then(resolve)
        .catch(reject);
});

const fileUpload = (reqBody) => new Promise((resolve, reject) => {
    console.log(reqBody);
    resolve([]);
});

const uploadFile = (file, type = 'image') => new Promise((resolve, reject) => {
    console.log(file);
    console.log(type);
    resolve([]);
});


module.exports = {
    getAll,
    getPaginatedComics,
    getAdminDashboardCounts,
    add,
    fileUpload,
    saveComicWithContent,
    getComicDetailByComicId,
    getComicByComicId,
    getComicContentByComicId,
    deleteComicWithContent,
    uploadFile
}
