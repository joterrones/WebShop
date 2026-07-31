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
exports.getCart = getCart;
exports.addItem = addItem;
exports.updateItem = updateItem;
exports.removeItem = removeItem;
exports.clear = clear;
const cartService = __importStar(require("../services/cart.service"));
const params_1 = require("../utils/params");
function sessionFrom(req) {
    const header = req.header('x-cart-session');
    const query = typeof req.query.sessionToken === 'string'
        ? req.query.sessionToken
        : '';
    const body = req.body && typeof req.body.sessionToken === 'string'
        ? req.body.sessionToken
        : '';
    return (header || query || body || '').trim();
}
async function getCart(req, res, next) {
    try {
        const cart = await cartService.getCart(sessionFrom(req));
        res.json(cart);
    }
    catch (err) {
        next(err);
    }
}
async function addItem(req, res, next) {
    try {
        const cart = await cartService.addCartItem(sessionFrom(req), req.body);
        res.status(201).json(cart);
    }
    catch (err) {
        next(err);
    }
}
async function updateItem(req, res, next) {
    try {
        const cart = await cartService.updateCartItem(sessionFrom(req), (0, params_1.getParam)(req.params.itemId), req.body);
        res.json(cart);
    }
    catch (err) {
        next(err);
    }
}
async function removeItem(req, res, next) {
    try {
        const cart = await cartService.removeCartItem(sessionFrom(req), (0, params_1.getParam)(req.params.itemId));
        res.json(cart);
    }
    catch (err) {
        next(err);
    }
}
async function clear(req, res, next) {
    try {
        const cart = await cartService.clearCart(sessionFrom(req));
        res.json(cart);
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=cart.controller.js.map