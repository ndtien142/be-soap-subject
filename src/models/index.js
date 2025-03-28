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

// Initialize the db object
const database = {};

// Import models
const Account = require('./user/account')(sequelize);
const Role = require('./user/role')(sequelize);
const KeyToken = require('./user/keyToken')(sequelize);

database.Account = Account;
database.Role = Role;
database.KeyToken = KeyToken;

// Add model to db object

// Define associations
database.Account.belongsTo(database.Role, {
    foreignKey: 'fk_role_id',
    as: 'role',
});
database.KeyToken.belongsTo(database.Account, { foreignKey: 'fk_user_code' });

// Sync the models with the database
sequelize
    .sync({ alter: true })
    .then(() => {
        console.log('Database & tables created!');
    })
    .catch((error) => {
        console.error('Error creating database & tables: ', error);
    });

database.Sequelize = Sequelize;
database.sequelize = sequelize;

module.exports = database;
