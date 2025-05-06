const db = require('../models');
const _ = require('lodash');

const getAll = () => new Promise((resolve, reject) => {
    db.banner.findAll({
        attributes: [
            'id',
            'banner1Image', 'banner1Link', 'banner1Title', 'banner1Description',
            'banner2Image', 'banner2Link', 'banner2Title', 'banner2Description',
            'banner3Image', 'banner3Link', 'banner3Title', 'banner3Description'
        ],
    })
        .then(resolve)
        .catch(reject);
});

const saveBanner = (bannerObj, bannerId, userDetails = {}) => new Promise((resolve, reject) => {
    const bannerData = {
        banner1Image: bannerObj.banner1Image,
        banner1Link: bannerObj.banner1Link,
        banner1Title: bannerObj.banner1Title,
        banner1Description: bannerObj.banner1Description,
        banner2Image: bannerObj.banner2Image,
        banner2Link: bannerObj.banner2Link,
        banner2Title: bannerObj.banner2Title,
        banner2Description: bannerObj.banner2Description,
        banner3Image: bannerObj.banner3Image,
        banner3Link: bannerObj.banner3Link,
        banner3Title: bannerObj.banner3Title,
        banner3Description: bannerObj.banner3Description,
    };
    if (bannerId) {
        bannerData.updatedAt = new Date();
        bannerData.updatedBy = _.get(userDetails, 'id', null);
        db.banner.update(bannerData, {
            where: { id: bannerId },
        })
            .then(resolve)
            .catch(reject);
    } else {
        bannerData.createdBy = _.get(userDetails, 'id', null);
        bannerData.createdAt = new Date();
        db.banner.create(bannerData)
            .then(resolve)
            .catch(reject);
    }
});

module.exports = {
    getAll,
    saveBanner,
}
