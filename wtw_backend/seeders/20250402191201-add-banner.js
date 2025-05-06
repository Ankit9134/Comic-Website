'use strict';
const config = require('../config');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        /**
         * Add seed commands here.
         *
         * Example:
         * await queryInterface.bulkInsert('People', [{
         *   name: 'John Doe',
         *   isBetaMember: false
         * }], {});
        */
        await queryInterface.bulkInsert('banners', [{
            id: 1,
            banner1Image: 'file-1744309816357-201408729.png',
            banner1Link: `${config.BASE_URL}/comic/getComicDetail?comicId=1`,
            banner1Title: 'Banner 1 Title',
            banner1Description: 'Banner 1 Description',
            banner2Image: 'file-1744309866079-125360900.png',
            banner2Link: `${config.BASE_URL}/comic/getComicDetail?comicId=2`,
            banner2Title: 'Banner 2 Title',
            banner2Description: 'Banner 2 Description',
            banner3Image: 'file-1744309898001-25972643.png',
            banner3Link: `${config.BASE_URL}/comic/getComicDetail?comicId=3`,
            banner3Title: 'Banner 3 Title',
            banner3Description: 'Banner 3 Description',
            createdBy: 1,
            updatedBy: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
        }], {});
    },

    async down(queryInterface, Sequelize) {
        /**
         * Add commands to revert seed here.
         *
         * Example:
         * await queryInterface.bulkDelete('People', null, {});
         */
        await queryInterface.bulkDelete('banners', { id: 1 }, {});
    }
};
