const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        actual_quantity: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        note: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    };

    const options = {
        tableName: 'tb_borrow_request_items',
        underscored: true,
        timestamps: true,
        createdAt: 'create_time',
        updatedAt: 'update_time',
    };

    const BorrowRequestItem = sequelize.define(
        'BorrowRequestItem',
        attributes,
        options,
    );

    return BorrowRequestItem;
}
