'use strict';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        queryInterface.createTable('users', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            firstName: {
                allowNull: false,
                type: Sequelize.STRING
            },
            lastName: {
                allowNull: false,
                type: Sequelize.STRING
            },
            email: {
                allowNull: false,
                type: Sequelize.STRING
            },
            username: {
                allowNull: false,
                type: Sequelize.STRING
            },
            password: {
                allowNull: false,
                type: Sequelize.STRING
            },
            userType: {
                allowNull: false,
                type: Sequelize.ENUM(['ADMIN', 'USER']),
            },
            activeSession: {
                allowNull: true,
                type: Sequelize.STRING,
                defaultValue: null,
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
    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('users');
    }
};
