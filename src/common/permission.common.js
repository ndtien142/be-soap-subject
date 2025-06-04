const PERMISSIONS = {
    Borrow: {
        CanRead: 'Borrow.CanRead',
        CanCreate: 'Borrow.CanCreate',
        CanApprove: 'Borrow.CanApprove',
        CanReject: 'Borrow.CanReject',
        CanMarkAsBorrowed: 'Borrow.CanMarkAsBorrowed',
        CanMarkAsReturned: 'Borrow.CanMarkAsReturned',
    },
    Import: {
        CanRead: 'Import.CanRead',
        CanCreate: 'Import.CanCreate',
        CanApprove: 'Import.CanApprove',
        CanReject: 'Import.CanReject',
    },
    Liquidation: {
        CanRead: 'Liquidation.CanRead',
        CanCreate: 'Liquidation.CanCreate',
        CanApprove: 'Liquidation.CanApprove',
        CanReject: 'Liquidation.CanReject',
    },
    Transfer: {
        CanRead: 'Transfer.CanRead',
        CanCreate: 'Transfer.CanCreate',
        CanApprove: 'Transfer.CanApprove',
        CanReject: 'Transfer.CanReject',
    },
    Statistic: {
        CanRead: 'Statistic.CanRead',
        CanExport: 'Statistic.CanExport',
    },
};

module.exports = PERMISSIONS;
