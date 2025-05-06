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
        return queryInterface.bulkInsert('users', [
            {
                id: 1,
                firstName: 'Netraj',
                lastName: "Patel",
                email: "ntrjpatel@gmail.com",
                username: "admin",
                password: "admin",
                userType: "ADMIN",
                activeSession: null,
                createdAt: new Date(),
                updatedAt: new Date()
            }, {
                id: 2,
                firstName: 'Netraj',
                lastName: "Patel",
                email: "ntrjpatel@gmail.com",
                username: "user",
                password: "user",
                userType: "USER",
                activeSession: null,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: 3,
                firstName: 'Sanket',
                lastName: "Phakatkar",
                email: "yoursocialguy.sanket@gmail.com",
                username: "sanket",
                password: "B@cchu36",
                userType: "ADMIN",
                activeSession: null,
                createdAt: new Date(),
                updatedAt: new Date()
            },
        ]).then(() => { })
            .catch((error) => console.error(error));
    },

    async down(queryInterface, Sequelize) {
        /**
         * Add commands to revert seed here.
         *
         * Example:
         * await queryInterface.bulkDelete('People', null, {});
         */
        await queryInterface.bulkDelete('users', { [Sequelize.Op.or]: [{ id: 1 }, { id: 2 }] });
    }
};
