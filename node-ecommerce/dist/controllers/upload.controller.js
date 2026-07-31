"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImages = uploadImages;
const media_1 = require("../utils/media");
/** POST /api/products/upload — recibe multipart field "images" */
async function uploadImages(req, res, next) {
    try {
        const files = req.files;
        if (!files || files.length === 0) {
            res.status(400).json({ error: 'No se enviaron imágenes' });
            return;
        }
        const images = files.map((file, index) => {
            const path = `/images/products/${file.filename}`;
            return {
                url: path,
                publicUrl: (0, media_1.toPublicUrl)(path),
                filename: file.filename,
                sortOrder: index,
                isPrimary: index === 0,
            };
        });
        res.status(201).json({ images });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=upload.controller.js.map