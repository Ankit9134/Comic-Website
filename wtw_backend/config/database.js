const fs = require('fs');
require('dotenv').config({ path: '.env' });

const dbs = {
    development: {
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        host: process.env.DB_HOST,
        dialect: 'mysql',
        migrationStorage: 'sequelize',
        seederStorage: 'sequelize',
        define: {
            charset: 'utf8',
            collate: 'utf8_general_ci',
            timestamps: true,
        },
        logging: false,
    },
    staging: {
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        host: process.env.DB_HOST,
        dialect: 'mysql',
        migrationStorage: 'sequelize',
        seederStorage: 'sequelize',
        define: {
            charset: 'utf8',
            collate: 'utf8_general_ci',
            timestamps: true,
        },
        logging: true,
    },
    production: {
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        host: process.env.DB_HOST,
        dialect: 'mysql',
        migrationStorage: 'sequelize',
        seederStorage: 'sequelize',
        define: {
            charset: 'utf8',
            collate: 'utf8_general_ci',
            timestamps: true,
        },
        logging: false,
    },
};

module.exports = dbs;
