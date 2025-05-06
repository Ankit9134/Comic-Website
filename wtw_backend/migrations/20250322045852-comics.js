'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('comics', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            comicName: {
                allowNull: false,
                type: Sequelize.STRING
            },
            description: {
                allowNull: true,
                type: Sequelize.STRING
            },
            genreId: {
                allowNull: false,
                type: Sequelize.INTEGER,
                references: { model: 'genres', key: 'id' }
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
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('comics');
    }
};
