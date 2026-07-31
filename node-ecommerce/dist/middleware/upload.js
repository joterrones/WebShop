"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadDir = exports.productImageUpload = void 0;
const multer_1 = __importDefault(require("multer"));
const fs_1 = require("fs");
const path_1 = require("path");
const env_1 = require("../config/env");
const error_handler_1 = require("./error-handler");
const uploadDir = (0, path_1.join)(env_1.publicDir, 'images', 'products');
exports.uploadDir = uploadDir;
if (!(0, fs_1.existsSync)(uploadDir)) {
    (0, fs_1.mkdirSync)(uploadDir, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
        const safe = file.originalname
            .toLowerCase()
            .replace(/[^a-z0-9.\-_]/g, '-');
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${unique}${(0, path_1.extname)(safe) || '.jpg'}`);
    },
});
const ALLOWED = new Set([
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml',
]);
exports.productImageUpload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 5 * 1024 * 1024, files: 10 },
    fileFilter: (_req, file, cb) => {
        if (!ALLOWED.has(file.mimetype)) {
            cb(new error_handler_1.AppError(400, 'Solo se permiten imágenes (jpg, png, webp, gif, svg)'));
            return;
        }
        cb(null, true);
    },
});
//# sourceMappingURL=upload.js.map