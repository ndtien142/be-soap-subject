const IMPORT_RECEIPT_STATUS = Object.freeze({
    requested: 'requested',
    approved: 'approved',
    completed: 'completed',
    rejected: 'rejected',
    received: 'received',
    returned: 'returned',
});

const DETAIL_EQUIPMENT_STATUS = Object.freeze({
    available: 'available',
    in_use: 'in_use',
    under_maintenance: 'under_maintenance',
    out_of_service: 'out_of_service',
    liquidation: 'liquidation',
});

module.exports = {
    IMPORT_RECEIPT_STATUS,
    DETAIL_EQUIPMENT_STATUS,
};
