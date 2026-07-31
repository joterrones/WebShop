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
exports.adminOnly = void 0;
exports.authenticate = authenticate;
exports.requireAdmin = requireAdmin;
const client_1 = require("@prisma/client");
const authService = __importStar(require("../services/auth.service"));
const error_handler_1 = require("./error-handler");
function authenticate(req, _res, next) {
    try {
        const header = req.headers.authorization;
        if (!header?.startsWith('Bearer ')) {
            throw new error_handler_1.AppError(401, 'Autenticación requerida');
        }
        const token = header.slice('Bearer '.length).trim();
        if (!token) {
            throw new error_handler_1.AppError(401, 'Autenticación requerida');
        }
        req.user = authService.verifyToken(token);
        next();
    }
    catch (err) {
        next(err);
    }
}
function requireAdmin(req, _res, next) {
    try {
        if (!req.user) {
            throw new error_handler_1.AppError(401, 'Autenticación requerida');
        }
        if (req.user.role !== client_1.UserRole.admin) {
            throw new error_handler_1.AppError(403, 'Acceso solo para administradores');
        }
        next();
    }
    catch (err) {
        next(err);
    }
}
/** Autenticación + rol admin en un solo paso */
exports.adminOnly = [authenticate, requireAdmin];
//# sourceMappingURL=auth.js.map