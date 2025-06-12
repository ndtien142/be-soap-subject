const FileAndImageService = require('../services/file-and-image/fileAndImage');
const { SuccessResponse, CREATED } = require('../core/success.response');

class FileImageController {
    // Upload equipment image (receipt-related)
    uploadEquipmentImage = async (req, res, next) => {
        const result = await FileAndImageService.uploadEquipmentImage({
            ...req.body,
            uploadedBy: req.user.userCode,
        });
        new CREATED({
            message: 'Upload equipment image successfully',
            metadata: result,
        }).send(res);
    };

    // Upload file for receipt
    uploadReceiptFile = async (req, res, next) => {
        const result = await FileAndImageService.uploadReceiptFile({
            ...req.body,
            uploadedBy: req.user.userCode,
        });
        new CREATED({
            message: 'Upload receipt file successfully',
            metadata: result,
        }).send(res);
    };

    // Upload multiple equipment images
    uploadMultipleEquipmentImages = async (req, res, next) => {
        const result = await FileAndImageService.uploadMultipleEquipmentImages(
            req.body.images.map((img) => ({
                ...img,
            })),
            req.user.userCode,
        );
        new CREATED({
            message: 'Upload multiple equipment images successfully',
            metadata: result,
        }).send(res);
    };

    // Upload multiple receipt files
    uploadMultipleReceiptFiles = async (req, res, next) => {
        const result = await FileAndImageService.uploadMultipleReceiptFiles(
            req.body.files.map((file) => ({
                ...file,
            })),
            req.user.userCode,
        );
        new CREATED({
            message: 'Upload multiple receipt files successfully',
            metadata: result,
        }).send(res);
    };

    // Get all images for a specific equipment (all actions)
    getAllImagesOfEquipment = async (req, res, next) => {
        const result = await FileAndImageService.getAllImagesOfEquipment(
            req.params.serialNumber,
        );
        new SuccessResponse({
            message: 'Get all images of equipment successfully',
            metadata: result,
        }).send(res);
    };

    // Get all files for a specific receipt
    getReceiptFiles = async (req, res, next) => {
        const result = await FileAndImageService.getReceiptFiles({
            receiptType: req.query.receiptType,
            receiptId: req.query.receiptId,
        });
        new SuccessResponse({
            message: 'Get receipt files successfully',
            metadata: result,
        }).send(res);
    };

    // Delete equipment image by id
    deleteEquipmentImage = async (req, res, next) => {
        await FileAndImageService.deleteEquipmentImage(req.params.id);
        new SuccessResponse({
            message: 'Delete equipment image successfully',
        }).send(res);
    };

    // Delete receipt file by id
    deleteReceiptFile = async (req, res, next) => {
        await FileAndImageService.deleteReceiptFile(req.params.id);
        new SuccessResponse({
            message: 'Delete receipt file successfully',
        }).send(res);
    };
}

module.exports = new FileImageController();
