'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface, Sequelize) => {
        return queryInterface.createTable('genres', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            genreName: {
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

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('genres');
    }
};
