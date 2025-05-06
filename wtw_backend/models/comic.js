'use strict';
const {
    Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Comic extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            Comic.hasMany(models.comic_content_map, {
                foreignKey: 'comicId',
                as: 'comicContent',
                onDelete: 'CASCADE',
            });
            Comic.belongsTo(models.genre, {
                foreignKey: 'genreId',
                as: 'genre',
                onDelete: 'CASCADE',
            });
        }
    };

    Comic.init({
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        comicName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false
        },
        genreId: {
            allowNull: true,
            type: DataTypes.INTEGER,
            onDelete: 'CASCADE',
            references: { model: 'genres', key: 'id' },
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
        modelName: 'comic',
    });

    return Comic;
};
