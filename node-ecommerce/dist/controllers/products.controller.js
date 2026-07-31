"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.list = list;
exports.getById = getById;
exports.create = create;
exports.update = update;
exports.remove = remove;
const productService = __importStar(require("../services/product.service"));
const params_1 = require("../utils/params");
async function list(req, res, next) {
    try {
        const result = await productService.listProducts(req.query);
        res.json(result);
    }
    catch (err) {
        next(err);
    }
}
async function getById(req, res, next) {
    try {
        const product = await productService.getProductById((0, params_1.getParam)(req.params.id));
        res.json(product);
    }
    catch (err) {
        next(err);
    }
}
async function create(req, res, next) {
    try {
        const product = await productService.createProduct(req.body);
        res.status(201).json(product);
    }
    catch (err) {
        next(err);
    }
}
async function update(req, res, next) {
    try {
        const product = await productService.updateProduct((0, params_1.getParam)(req.params.id), req.body);
        res.json(product);
    }
    catch (err) {
        next(err);
    }
}
async function remove(req, res, next) {
    try {
        const result = await productService.deleteProduct((0, params_1.getParam)(req.params.id));
        res.json(result);
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=products.controller.js.map