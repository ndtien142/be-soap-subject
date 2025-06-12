const database = require('../../models');

class FileAndImageService {
    /**
     * Upload an equipment image.
     * @param {object} params
     * @param {'import'|'transfer'|'liquidation'|'borrow'|'return'|'owner'} params.actionType
     * @param {number} params.actionId
     * @param {string} params.serialNumber
     * @param {string} params.imageUrl
     * @param {string} params.note
     * @param {string} params.uploadedBy
     * @returns {Promise<object>}
     */
    static async uploadEquipmentImage({
        actionType,
        actionId = null,
        serialNumber,
        imageUrl,
        note = '',
        uploadedBy,
    }) {
        return database.EquipmentImages.create({
            action_type: actionType,
            action_id: actionId,
            serial_number: serialNumber,
            image_url: imageUrl,
            note,
            uploaded_by: uploadedBy,
            uploaded_at: new Date(),
        });
    }

    /**
     * Upload a file for a receipt.
     * @param {object} params
     * @param {'import'|'transfer'|'liquidation'|'borrow'|'return'} params.receiptType
     * @param {number} params.receiptId
     * @param {string} params.filePath
     * @param {string} params.fileName
     * @param {string} params.uploadBy
     * @param {string} [params.note]
     * @returns {Promise<object>}
     */
    static async uploadReceiptFile({
        receiptType,
        receiptId,
        filePath,
        fileName,
        uploadBy,
        note,
    }) {
        return database.ReceiptFiles.create({
            receipt_type: receiptType,
            receipt_id: receiptId,
            file_path: filePath,
            file_name: fileName,
            upload_by: uploadBy,
            upload_time: new Date(),
            note,
        });
    }

    /**
     * Upload multiple equipment images.
     * @param {Array<object>} images
     * Each object: { actionType, actionId, serialNumber, imageUrl, note, uploadedBy }
     * @returns {Promise<Array>}
     */
    static async uploadMultipleEquipmentImages(images, uploader) {
        if (!Array.isArray(images) || images.length === 0) return [];
        const records = images.map((img) => ({
            action_type: img.actionType,
            action_id: img.actionId ?? null,
            serial_number: img.serialNumber,
            image_url: img.imageUrl,
            note: img.note ?? '',
            uploaded_by: uploader,
            uploaded_at: new Date(),
        }));
        return database.EquipmentImages.bulkCreate(records);
    }

    /**
     * Upload multiple receipt files.
     * @param {Array<object>} files
     * Each object: { receiptType, receiptId, filePath, fileName, uploadBy, note }
     * @returns {Promise<Array>}
     */
    static async uploadMultipleReceiptFiles(files, uploader) {
        if (!Array.isArray(files) || files.length === 0) return [];
        const records = files.map((file) => ({
            receipt_type: file.receiptType,
            receipt_id: file.receiptId,
            file_path: file.filePath,
            file_name: file.fileName,
            upload_by: uploader,
            upload_time: new Date(),
            note: file.note,
        }));
        return database.ReceiptFiles.bulkCreate(records);
    }

    /**
     * Get all images for a specific equipment and action.
     * @param {string} serialNumber
     * @param {string} [actionType]
     * @param {number} [actionId]
     * @returns {Promise<Array>}
     */
    static async getEquipmentImages({ serialNumber, actionType, actionId }) {
        const where = { serial_number: serialNumber };
        if (actionType) where.action_type = actionType;
        if (actionId) where.action_id = actionId;
        const images = await database.EquipmentImages.findAllAndCount({
            where,
        });

        return {
            code: 200,
            message: 'Get equipment images successfully',
            metadata: images?.rows?.map((image) => {
                return {
                    id: image.id,
                    serialNumber: image.serial_number,
                    imageUrl: image.image_url,
                    note: image.note,
                };
            }),
        };
    }

    /**
     * Get all files for a specific receipt.
     * @param {string} receiptType
     * @param {number} receiptId
     * @returns {Promise<Array>}
     */
    static async getReceiptFiles({ receiptType, receiptId }) {
        const files = await database.ReceiptFiles.findAll({
            where: {
                receipt_type: receiptType,
                receipt_id: receiptId,
            },
        });
        return {
            code: 200,
            message: 'Get receipt files successfully',
            metadata: files?.map((file) => {
                return {
                    id: file.id,
                    receiptType: file.receipt_type,
                    receiptId: file.receipt_id,
                    filePath: file.file_path,
                    fileName: file.file_name,
                    uploadBy: file.upload_by,
                    uploadTime: file.upload_time,
                    note: file.note,
                };
            }),
        };
    }

    /**
     * Get all images for a specific equipment (all actions).
     * @param {string} serialNumber
     * @returns {Promise<Array>}
     */
    static async getAllImagesOfEquipment(serialNumber) {
        const images = await database.EquipmentImages.findAll({
            where: { serial_number: serialNumber },
        });
        return {
            code: 200,
            message: 'Get all images of equipment successfully',
            metadata: images?.map((image) => {
                return {
                    id: image.id,
                    serialNumber: image.serial_number,
                    imageUrl: image.image_url,
                    note: image.note,
                };
            }),
        };
    }
    /**
     * Delete an equipment image by id.
     * @param {number} id
     * @returns {Promise}
     */
    static async deleteEquipmentImage(id) {
        return database.EquipmentImages.destroy({ where: { id } });
    }

    /**
     * Delete a receipt file by id.
     * @param {number} id
     * @returns {Promise}
     */
    static async deleteReceiptFile(id) {
        return database.ReceiptFiles.destroy({ where: { id } });
    }
}

module.exports = FileAndImageService;
