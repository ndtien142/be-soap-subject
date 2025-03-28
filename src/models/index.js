'use strict';

const Sequelize = require('sequelize');
const {
    db: { host, port, name, user, password, dialect },
} = require('../configs/config.mongodb');

const sequelize = new Sequelize(name, user, password, {
    host: host,
    dialect: dialect,
});

sequelize
    .authenticate()
    .then(() => {
        console.log('Connection has been established successfully.');
    })
    .catch((error) => {
        console.error('Unable to connect to the database: ', error);
    });

const db = {};

// Import models

db.Sequelize = Sequelize;

module.exports = db;
