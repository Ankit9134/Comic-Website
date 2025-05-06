'use strict';

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
        return queryInterface.bulkInsert('genres', [
            {
                id: 1,
                genreName: 'Drama',
                createdBy: 1,
                updatedBy: 1,
                createdAt: new Date(),
                updatedAt: new Date()
            }, {
                id: 2,
                genreName: 'Comedy',
                createdBy: 1,
                updatedBy: 1,
                createdAt: new Date(),
                updatedAt: new Date()
            }, {
                id: 3,
                genreName: 'Sci-Fi',
                createdBy: 1,
                updatedBy: 1,
                createdAt: new Date(),
                updatedAt: new Date()
            }, {
                id: 4,
                genreName: 'Action',
                createdBy: 1,
                updatedBy: 1,
                createdAt: new Date(),
                updatedAt: new Date()
            }, {
                id: 5,
                genreName: 'Romance',
                createdBy: 1,
                updatedBy: 1,
                createdAt: new Date(),
                updatedAt: new Date()
            }, {
                id: 6,
                genreName: 'Fantasy',
                createdBy: 1,
                updatedBy: 1,
                createdAt: new Date(),
                updatedAt: new Date()
            }, {
                id: 7,
                genreName: 'Slice Of Life',
                createdBy: 1,
                updatedBy: 1,
                createdAt: new Date(),
                updatedAt: new Date()
            }, {
                id: 8,
                genreName: 'Superhero',
                createdBy: 1,
                updatedBy: 1,
                createdAt: new Date(),
                updatedAt: new Date()
            }, {
                id: 9,
                genreName: 'Thriller',
                createdBy: 1,
                updatedBy: 1,
                createdAt: new Date(),
                updatedAt: new Date()
            }, {
                id: 10,
                genreName: 'Supernatural',
                createdBy: 1,
                updatedBy: 1,
                createdAt: new Date(),
                updatedAt: new Date()
            }, {
                id: 11,
                genreName: 'Mystery',
                createdBy: 1,
                updatedBy: 1,
                createdAt: new Date(),
                updatedAt: new Date()
            }, {
                id: 12,
                genreName: 'Sports',
                createdBy: 1,
                updatedBy: 1,
                createdAt: new Date(),
                updatedAt: new Date()
            }, {
                id: 13,
                genreName: 'Historical',
                createdBy: 1,
                updatedBy: 1,
                createdAt: new Date(),
                updatedAt: new Date()
            }, {
                id: 14,
                genreName: 'Horror',
                createdBy: 1,
                updatedBy: 1,
                createdAt: new Date(),
                updatedAt: new Date()
            }, {
                id: 15,
                genreName: 'Mythical',
                createdBy: 1,
                updatedBy: 1,
                createdAt: new Date(),
                updatedAt: new Date()
            },
        ]);
    },

    async down(queryInterface, Sequelize) {
        /**
         * Add commands to revert seed here.
         *
         * Example:
         * await queryInterface.bulkDelete('People', null, {});
         */
        await queryInterface.bulkDelete('genres', { [Sequelize.Op.or]: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }, { id: 6 }, { id: 7 }, { id: 8 }, { id: 9 }, { id: 10 }, { id: 11 }, { id: 12 }, { id: 13 }, { id: 14 }, { id: 15 }] });
    }
};
