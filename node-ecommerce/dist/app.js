"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const env_1 = require("./config/env");
const error_handler_1 = require("./middleware/error-handler");
const routes_1 = __importDefault(require("./routes"));
function createApp() {
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)({
        origin: env_1.env.CORS_ORIGIN,
        credentials: true,
    }));
    app.use(express_1.default.json());
    // Archivos estáticos: http://localhost:3000/images/...
    app.use('/images', express_1.default.static(`${env_1.publicDir}/images`));
    app.use('/api', routes_1.default);
    app.use(error_handler_1.errorHandler);
    return app;
}
//# sourceMappingURL=app.js.map