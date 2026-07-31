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
exports.create = create;
exports.list = list;
exports.getById = getById;
exports.updateStatus = updateStatus;
exports.applyAdjustment = applyAdjustment;
const orderService = __importStar(require("../services/order.service"));
const params_1 = require("../utils/params");
async function create(req, res, next) {
    try {
        const order = await orderService.createOrder(req.body);
        res.status(201).json(order);
    }
    catch (err) {
        next(err);
    }
}
async function list(req, res, next) {
    try {
        const result = await orderService.listOrders(req.query);
        res.json(result);
    }
    catch (err) {
        next(err);
    }
}
async function getById(req, res, next) {
    try {
        const order = await orderService.getOrderById((0, params_1.getParam)(req.params.id));
        res.json(order);
    }
    catch (err) {
        next(err);
    }
}
async function updateStatus(req, res, next) {
    try {
        const order = await orderService.updateOrderStatus((0, params_1.getParam)(req.params.id), req.body);
        res.json(order);
    }
    catch (err) {
        next(err);
    }
}
async function applyAdjustment(req, res, next) {
    try {
        const order = await orderService.applyOrderAdjustment((0, params_1.getParam)(req.params.id), req.body);
        res.json(order);
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=orders.controller.js.map