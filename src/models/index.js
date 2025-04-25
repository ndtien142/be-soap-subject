'use strict';

const Sequelize = require('sequelize');
const {
    db: { host, port, name, user, password, dialect },
} = require('../configs/config.mongodb');

const sequelize = new Sequelize(name, user, password, {
    host: host,
    dialect: dialect,
    port
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
const RefreshTokenUsed = require('./user/refreshTokenUsed')(sequelize);
const Permission = require('./user/permission')(sequelize);

//  Import Equipment models
const Equipment = require('./equipment/equipment')(sequelize);
const EquipmentType = require('./equipment/equipmentType')(sequelize);
const UnitOfMeasure = require('./equipment/unitOfMeasure')(sequelize);
const EquipmentManufacturer = require('./equipment/equipmentManufacturer')(
    sequelize,
);
const GroupEquipment = require('./equipment/groupEquipment')(sequelize);

// Import models import receipt
const ImportReceipt = require('./import-receipt/importReceipt')(sequelize);
const DetailImportReceipt = require('./import-receipt/detailImportReceipt')(
    sequelize,
);
const Supplier = require('./import-receipt/supplier')(sequelize);
// Import models liquidation receipt
const LiquidationReceipt = require('./liquidation-receipt/liquidationReceipt')(
    sequelize,
);
const LiquidationReceiptDetail =
    require('./liquidation-receipt/liquidationReceiptDetail')(sequelize);

// Import models department
const Department = require('./department/department')(sequelize);
const Room = require('./department/room')(sequelize);

// Import models transfer receipt
const TransferReceipt = require('./transfer-receipt/transferReceipt')(
    sequelize,
);
const TransferReceiptDetail =
    require('./transfer-receipt/transferReceiptDetail')(sequelize);

database.Account = Account;
database.Role = Role;
database.KeyToken = KeyToken;
database.RefreshTokenUsed = RefreshTokenUsed;
database.Permission = Permission;

// Equipment
database.Equipment = Equipment;
database.EquipmentType = EquipmentType;
database.UnitOfMeasure = UnitOfMeasure;
database.EquipmentManufacturer = EquipmentManufacturer;
database.GroupEquipment = GroupEquipment;

// Import receipt
database.ImportReceipt = ImportReceipt;
database.DetailImportReceipt = DetailImportReceipt;
database.Supplier = Supplier;

// Liquidation receipt
database.LiquidationReceipt = LiquidationReceipt;
database.LiquidationReceiptDetail = LiquidationReceiptDetail;

// Department
database.Department = Department;
database.Room = Room;

// Transfer receipt
database.TransferReceipt = TransferReceipt;
database.TransferReceiptDetail = TransferReceiptDetail;

// Add model to db object

// Define associations
database.Account.belongsTo(database.Role, {
    foreignKey: 'fk_role_id',
    as: 'role',
});
database.KeyToken.belongsTo(database.Account, { foreignKey: 'fk_user_code' });
database.RefreshTokenUsed.belongsTo(database.KeyToken, {
    foreignKey: 'fk_user_code',
    targetKey: 'fk_user_code',
});
database.Permission.belongsToMany(database.Role, {
    through: 'tb_role_permission',
    foreignKey: 'fk_permission_id',
});
database.Role.belongsToMany(database.Permission, {
    through: 'tb_role_permission',
    foreignKey: 'fk_role_id',
});

// Equipment associations
database.Equipment.belongsTo(database.EquipmentType, {
    foreignKey: 'fk_equipment_type_id',
});

database.Equipment.belongsTo(database.UnitOfMeasure, {
    foreignKey: 'fk_unit_of_measure_id',
});

database.Equipment.belongsTo(database.GroupEquipment, {
    foreignKey: 'fk_group_equipment_code',
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

database.ImportReceipt.belongsToMany(GroupEquipment, {
    through: DetailImportReceipt,
});

database.Equipment.belongsTo(ImportReceipt, {
    foreignKey: 'fk_import_receipt_id',
});

// Liquidation receipt associations
database.LiquidationReceipt.belongsTo(database.Account, {
    foreignKey: 'fk_user_code',
});

database.LiquidationReceipt.belongsToMany(GroupEquipment, {
    through: LiquidationReceiptDetail,
});

// Transfer receipt associations
database.TransferReceipt.belongsTo(database.Account, {
    foreignKey: 'fk_user_code',
});
database.TransferReceipt.belongsTo(database.Room, {
    foreignKey: 'fk_transfer_from',
});
database.TransferReceipt.belongsTo(database.Room, {
    foreignKey: 'fk_transfer_to',
});
database.TransferReceipt.belongsToMany(GroupEquipment, {
    through: TransferReceiptDetail,
});

// Department associations
database.Room.belongsTo(database.Department, {
    foreignKey: 'fk_department_id',
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
