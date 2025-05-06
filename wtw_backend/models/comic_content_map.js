'use strict';
const {
    Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Comic_content_map extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            Comic_content_map.belongsTo(models.comic, {
                foreignKey: 'comicId',
                as: 'comic',
                onDelete: 'CASCADE',
            });
        }
    };

    Comic_content_map.init({
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        comicId: {
            allowNull: true,
            type: DataTypes.INTEGER,
            onDelete: 'CASCADE',
            references: { model: 'comics', key: 'id' },
        },
        imageFileName: {
            allowNull: true,
            type: DataTypes.STRING,
        },
        audioFileName: {
            allowNull: true,
            type: DataTypes.STRING,
        },
        length: {
            allowNull: false,
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        sceneNumber: {
            allowNull: false,
            type: DataTypes.INTEGER
        },
        createdBy: {
            allowNull: true,
            type: DataTypes.INTEGER,
            onDelete: 'CASCADE',
            references: { model: 'users', key: 'id' },
        },
        updatedBy: {
            allowNull: true,
            type: DataTypes.INTEGER,
            onDelete: 'CASCADE',
            references: { model: 'users', key: 'id' }
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
        modelName: 'comic_content_map',
    });

    return Comic_content_map;
};
