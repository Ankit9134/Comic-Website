'use strict';
const {
    Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class User extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            // this.hasMany(models.banner, { foreignKey: 'createdBy', as: 'createdByUser' });
            // this.hasMany(models.banner, { foreignKey: 'updatedBy', as: 'updatedByUser' });
            // this.hasMany(models.genre, { foreignKey: 'createdBy', as: 'createdByUser' });
            // this.hasMany(models.genre, { foreignKey: 'updatedBy', as: 'updatedByUser' });
        }
    };

    User.init({
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        firstName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        lastName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        userType: {
            type: DataTypes.ENUM(['ADMIN', 'USER']),
            allowNull: false
        },
        activeSession: {
            type: DataTypes.STRING,
            allowNull: true
        },
        createdAt: {
            allowNull: false,
            type: DataTypes.DATE,
            defaultValue: sequelize.NOW,
        },
        updatedAt: {
            allowNull: false,
            type: DataTypes.DATE,
            defaultValue: sequelize.NOW,
        }
    }, {
        sequelize,
        modelName: 'user',
    });

    return User;
};
