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
//  Import Equipment models
const EquipmentStatus = require('./equipment/equipmentStatus')(sequelize);
const Equipment = require('./equipment/equipment')(sequelize);
const EquipmentType = require('./equipment/equipmentType')(sequelize);
const UnitOfMeasure = require('./equipment/unitOfMeasure')(sequelize);
const DetailEquipment = require('./equipment/detailEquipment')(sequelize);

// Import models import receipt
const ImportReceipt = require('./import-receipt/importReceipt')(sequelize);
const DetailImportReceipt = require('./import-receipt/detailImportReceipt')(
    sequelize,
);
const Supplier = require('./import-receipt/supplier')(sequelize);

database.Account = Account;
database.Role = Role;
database.KeyToken = KeyToken;

// Equipment
database.EquipmentStatus = EquipmentStatus;
database.Equipment = Equipment;
database.EquipmentType = EquipmentType;
database.UnitOfMeasure = UnitOfMeasure;
database.DetailEquipment = DetailEquipment;
// Import receipt
database.ImportReceipt = ImportReceipt;
database.DetailImportReceipt = DetailImportReceipt;
database.Supplier = Supplier;

// Add model to db object

// Define associations
database.Account.belongsTo(database.Role, {
    foreignKey: 'fk_role_id',
    as: 'role',
});
database.KeyToken.belongsTo(database.Account, { foreignKey: 'fk_user_code' });

// Equipment associations
database.Equipment.belongsTo(database.EquipmentType, {
    foreignKey: 'fk_equipment_type_id',
});

database.Equipment.belongsTo(database.UnitOfMeasure, {
    foreignKey: 'fk_unit_of_measure_id',
});

database.DetailEquipment.belongsTo(database.Equipment, {
    foreignKey: 'fk_equipment_code',
});

database.DetailEquipment.belongsTo(database.EquipmentStatus, {
    foreignKey: 'fk_equipment_status_id',
});

// Import receipt associations
database.Supplier.hasMany(database.ImportReceipt, {
    foreignKey: 'fk_supplier_id',
});
database.ImportReceipt.belongsTo(database.Supplier, {
    foreignKey: 'fk_supplier_id',
});

database.ImportReceipt.belongsTo(database.Account, {
    foreignKey: 'fk_user_code',
});

database.ImportReceipt.belongsToMany(Equipment, {
    through: DetailImportReceipt,
});

database.DetailEquipment.belongsTo(ImportReceipt, {
    foreignKey: 'fk_import_receipt_id',
});

// Sync the models with the database
sequelize
    .sync({ sync: true })
    .then(() => {
        console.log('Database & tables created!');
    })
    .catch((error) => {
        console.error('Error creating database & tables: ', error);
    });

database.Sequelize = Sequelize;
database.sequelize = sequelize;

module.exports = database;
