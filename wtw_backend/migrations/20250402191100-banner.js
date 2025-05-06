'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        /**
         * Add altering commands here.
         *
         * Example:
         * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
         */
        return queryInterface.createTable('banners', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            banner1Image: {
                type: Sequelize.STRING
            },
            banner1Link: {
                type: Sequelize.STRING
            },
            banner1Title: {
                type: Sequelize.STRING
            },
            banner1Description: {
                type: Sequelize.STRING
            },
            banner2Image: {
                type: Sequelize.STRING
            },
            banner2Link: {
                type: Sequelize.STRING
            },
            banner2Title: {
                type: Sequelize.STRING
            },
            banner2Description: {
                type: Sequelize.STRING
            },
            banner3Image: {
                type: Sequelize.STRING
            },
            banner3Link: {
                type: Sequelize.STRING
            },
            banner3Title: {
                type: Sequelize.STRING
            },
            banner3Description: {
                type: Sequelize.STRING
            },
            createdBy: {
                allowNull: true,
                type: Sequelize.INTEGER,
                references: { model: 'users', key: 'id' }
            },
            updatedBy: {
                allowNull: true,
                type: Sequelize.INTEGER,
                references: { model: 'users', key: 'id' }
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            }
        }).catch((error) => console.error(error))
    },

    async down(queryInterface, Sequelize) {
        /**
         * Add reverting commands here.
         *
         * Example:
         * await queryInterface.dropTable('users');
         */
        return queryInterface.dropTable('banners');
    }
};
