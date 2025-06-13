'use strict';

const Sequelize = require('sequelize');
const {
    db: { host, port, name, user, password, dialect },
} = require('../configs/config.mongodb');

const sequelize = new Sequelize(name, user, password, {
    host: host,
    port: port,
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
const RefreshTokenUsed = require('./user/refreshTokenUsed')(sequelize);
const Permission = require('./user/permission')(sequelize);
const Profile = require('./user/profile')(sequelize);

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

// import models borrow receipt
const BorrowReceipt = require('./borrow-receipt/borrowReceipt')(sequelize);
const BorrowReceiptDetail = require('./borrow-receipt/borrowReceiptDetail')(
    sequelize,
);
const BorrowRequestItem = require('./borrow-receipt/borrowRequestItem')(
    sequelize,
);

// Import models for files and images
const EquipmentImages = require('./files/equipmentImages')(sequelize);
const ReceiptFiles = require('./files/receiptFiles')(sequelize);

// Import notification model
const Notification = require('./notification/notification')(sequelize);

database.Account = Account;
database.Role = Role;
database.KeyToken = KeyToken;
database.RefreshTokenUsed = RefreshTokenUsed;
database.Permission = Permission;
database.Profile = Profile;

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

// Borrow receipt
database.BorrowReceipt = BorrowReceipt;
database.BorrowReceiptDetail = BorrowReceiptDetail;
database.BorrowRequestItem = BorrowRequestItem;

// Files and images
database.EquipmentImages = EquipmentImages;
database.ReceiptFiles = ReceiptFiles;

// Notification
database.Notification = Notification;

// Add model to db object

// Define associations
database.Account.belongsTo(database.Role, {
    foreignKey: 'role_id',
    as: 'role',
});
database.KeyToken.belongsTo(database.Account, {
    foreignKey: 'user_code',
    as: 'account',
});
database.RefreshTokenUsed.belongsTo(database.KeyToken, {
    foreignKey: 'user_code',
    targetKey: 'user_code',
    as: 'key_token',
});
database.Permission.belongsToMany(database.Role, {
    through: 'tb_role_permission',
    foreignKey: 'permission_id',
    as: 'roles',
});
database.Role.belongsToMany(database.Permission, {
    through: 'tb_role_permission',
    foreignKey: 'role_id',
    as: 'permissions',
});

database.Profile.belongsTo(database.Account, {
    foreignKey: 'user_code',
    as: 'account',
});

// Equipment associations
database.GroupEquipment.belongsTo(database.EquipmentType, {
    foreignKey: 'equipment_type_id',
    as: 'equipment_type',
});

database.GroupEquipment.belongsTo(database.UnitOfMeasure, {
    foreignKey: 'unit_of_measure_id',
    as: 'unit_of_measure',
});

database.GroupEquipment.belongsTo(database.EquipmentManufacturer, {
    foreignKey: 'equipment_manufacturer_id',
    as: 'equipment_manufacturer',
});

database.Equipment.belongsTo(database.GroupEquipment, {
    foreignKey: 'group_equipment_code',
    as: 'group_equipment',
});

database.GroupEquipment.hasMany(database.Equipment, {
    foreignKey: 'group_equipment_code',
    as: 'equipments',
});

database.Equipment.belongsTo(database.Room, {
    foreignKey: 'room_id',
    as: 'room',
});

// Import receipt associations
database.Supplier.hasMany(database.ImportReceipt, {
    foreignKey: 'supplier_id',
});
database.ImportReceipt.belongsTo(database.Supplier, {
    foreignKey: 'supplier_id',
    as: 'supplier',
});

database.ImportReceipt.belongsTo(database.Account, {
    foreignKey: 'user_code',
});

database.ImportReceipt.belongsTo(database.Account, {
    foreignKey: 'approved_by',
    as: 'approver',
});

database.ImportReceipt.belongsToMany(database.GroupEquipment, {
    through: DetailImportReceipt,
    foreignKey: 'import_receipt_id',
    as: 'group_equipment',
});
database.GroupEquipment.belongsToMany(database.ImportReceipt, {
    through: DetailImportReceipt,
    foreignKey: 'group_equipment_code',
    as: 'import_receipts',
});

database.Equipment.belongsTo(ImportReceipt, {
    foreignKey: 'import_receipt_id',
    as: 'import_receipt',
});

// Liquidation receipt associations
database.LiquidationReceipt.belongsTo(database.Account, {
    foreignKey: 'user_code',
    as: 'account',
});

database.LiquidationReceipt.belongsToMany(database.Equipment, {
    through: LiquidationReceiptDetail,
    foreignKey: 'liquidation_receipt_id',
    as: 'equipment',
});

database.LiquidationReceipt.belongsTo(database.Account, {
    foreignKey: 'approved_by',
    as: 'approver',
});

database.Equipment.belongsToMany(database.LiquidationReceipt, {
    through: LiquidationReceiptDetail,
    foreignKey: 'serial_number',
    as: 'liquidation_receipts',
});

// Transfer receipt associations
database.TransferReceipt.belongsTo(database.Account, {
    foreignKey: 'user_code',
});
database.TransferReceipt.belongsTo(database.Room, {
    foreignKey: 'transfer_from',
});
database.TransferReceipt.belongsTo(database.Account, {
    foreignKey: 'approved_by',
    as: 'approver',
});
database.TransferReceipt.belongsTo(database.Room, {
    foreignKey: 'transfer_to',
});
database.TransferReceipt.belongsToMany(database.Equipment, {
    through: TransferReceiptDetail,
    foreignKey: 'transfer_receipt_id',
    as: 'equipment',
});
database.Equipment.belongsToMany(database.TransferReceipt, {
    through: TransferReceiptDetail,
    foreignKey: 'serial_number',
    as: 'transfer_receipts',
});

// Borrow receipt associations
database.BorrowReceipt.belongsTo(database.Account, {
    foreignKey: 'user_code',
    as: 'account',
});
database.BorrowReceipt.belongsTo(database.Room, {
    foreignKey: 'room_id',
    as: 'room',
});
database.BorrowReceipt.belongsToMany(database.Equipment, {
    through: BorrowReceiptDetail,
    foreignKey: 'borrow_receipt_id',
    as: 'equipment',
});
database.Equipment.belongsToMany(database.BorrowReceipt, {
    through: BorrowReceiptDetail,
    foreignKey: 'serial_number',
    as: 'borrow_receipts',
});
database.BorrowReceipt.belongsToMany(database.GroupEquipment, {
    through: BorrowRequestItem,
    foreignKey: 'borrow_id',
    as: 'group_equipment',
});
database.GroupEquipment.belongsToMany(database.BorrowReceipt, {
    through: BorrowRequestItem,
    foreignKey: 'equipment_code',
    as: 'borrow_receipts',
});

// Department associations
database.Room.belongsTo(database.Department, {
    foreignKey: 'department_id',
    as: 'department',
});

// Images
database.Equipment.hasMany(database.EquipmentImages, {
    foreignKey: 'serial_number',
    sourceKey: 'serial_number',
    as: 'images',
});

database.EquipmentImages.belongsTo(database.Equipment, {
    foreignKey: 'serial_number',
    targetKey: 'serial_number',
    as: 'equipment',
});

// Sync the models with the database
sequelize
    .sync()
    .then(() => {
        console.log('Database & tables created!');
    })
    .catch((error) => {
        console.error('Error creating database & tables: ', error);
    });

database.Sequelize = Sequelize;
database.sequelize = sequelize;

module.exports = database;
