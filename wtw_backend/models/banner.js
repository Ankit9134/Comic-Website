'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Banner extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            this.belongsTo(models.user, { foreignKey: 'createdBy', as: 'createdByUser' });
            this.belongsTo(models.user, { foreignKey: 'updatedBy', as: 'updatedByUser' });
        }
    }
    Banner.init({
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        banner1Image: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        banner1Link: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        banner1Title: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        banner1Description: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        banner2Image: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        banner2Link: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        banner2Title: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        banner2Description: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        banner3Image: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        banner3Link: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        banner3Title: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        banner3Description: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        createdBy: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: { model: 'users', key: 'id' }
        },
        updatedBy: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: { model: 'users', key: 'id' }
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize.NOW,
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize.NOW,
        },
    }, {
        sequelize,
        modelName: 'banner',
    });
    return Banner;
};