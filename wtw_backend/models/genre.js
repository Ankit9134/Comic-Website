'use strict';
const {
    Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Genre extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            Genre.hasMany(models.comic, {
                foreignKey: 'genreId',
                as: 'comics',
                onDelete: 'CASCADE',
            });
        }
    };

    Genre.init({
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        genreName: {
            type: DataTypes.STRING,
            allowNull: false
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
        modelName: 'genre',
    });

    return Genre;
};
