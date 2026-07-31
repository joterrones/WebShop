"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("./auth.routes"));
const categories_routes_1 = __importDefault(require("./categories.routes"));
const products_routes_1 = __importDefault(require("./products.routes"));
const attributes_routes_1 = __importDefault(require("./attributes.routes"));
const orders_routes_1 = __importDefault(require("./orders.routes"));
const settings_routes_1 = __importDefault(require("./settings.routes"));
const cart_routes_1 = __importDefault(require("./cart.routes"));
const router = (0, express_1.Router)();
router.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'node-ecommerce' });
});
router.use('/auth', auth_routes_1.default);
router.use('/categories', categories_routes_1.default);
router.use('/products', products_routes_1.default);
router.use('/attributes', attributes_routes_1.default);
router.use('/orders', orders_routes_1.default);
router.use('/settings', settings_routes_1.default);
router.use('/cart', cart_routes_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map