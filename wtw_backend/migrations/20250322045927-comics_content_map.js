'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('comic_content_maps', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            comicId: {
                allowNull: false,
                type: Sequelize.INTEGER,
                references: { model: 'comics', key: 'id' }
            },
            imageFileName: {
                allowNull: false,
                type: Sequelize.STRING,
            },
            audioFileName: {
                allowNull: false,
                type: Sequelize.STRING,
            },
            length: {
                allowNull: false,
                type: Sequelize.INTEGER,
            },
            sceneNumber: {
                allowNull: false,
                type: Sequelize.INTEGER
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
        }).catch((error) => { console.log(error) });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('comic_content_map');
    }
};
