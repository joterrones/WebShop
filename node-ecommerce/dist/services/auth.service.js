"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signToken = signToken;
exports.verifyToken = verifyToken;
exports.login = login;
exports.getUserById = getUserById;
exports.changePassword = changePassword;
exports.ensureAdminUser = ensureAdminUser;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const env_1 = require("../config/env");
const prisma_1 = require("../lib/prisma");
const error_handler_1 = require("../middleware/error-handler");
const loginSchema = zod_1.z.object({
    username: zod_1.z.string().trim().min(1, 'Usuario requerido').max(80),
    password: zod_1.z.string().min(1, 'Clave requerida').max(128),
});
function toAuthUser(user) {
    return {
        id: user.id,
        username: user.username,
        role: user.role,
    };
}
function signToken(user) {
    return jsonwebtoken_1.default.sign({ sub: user.id, username: user.username, role: user.role }, env_1.env.JWT_SECRET, { expiresIn: env_1.env.JWT_EXPIRES_IN });
}
function verifyToken(token) {
    try {
        const payload = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
        if (typeof payload.sub !== 'string' ||
            typeof payload.username !== 'string' ||
            (payload.role !== 'admin' && payload.role !== 'user')) {
            throw new error_handler_1.AppError(401, 'Token inválido');
        }
        return {
            id: payload.sub,
            username: payload.username,
            role: payload.role,
        };
    }
    catch (err) {
        if (err instanceof error_handler_1.AppError)
            throw err;
        throw new error_handler_1.AppError(401, 'Token inválido o expirado');
    }
}
async function login(data) {
    const { username, password } = loginSchema.parse(data);
    const user = await prisma_1.prisma.user.findUnique({
        where: { username: username.toLowerCase() },
    });
    if (!user) {
        throw new error_handler_1.AppError(401, 'Usuario o clave incorrectos');
    }
    const valid = await bcryptjs_1.default.compare(password, user.passwordHash);
    if (!valid) {
        throw new error_handler_1.AppError(401, 'Usuario o clave incorrectos');
    }
    const authUser = toAuthUser(user);
    return {
        token: signToken(authUser),
        user: authUser,
    };
}
async function getUserById(id) {
    const user = await prisma_1.prisma.user.findUnique({ where: { id } });
    if (!user) {
        throw new error_handler_1.AppError(401, 'Usuario no encontrado');
    }
    return toAuthUser(user);
}
const changePasswordSchema = zod_1.z.object({
    currentPassword: zod_1.z.string().min(1, 'Clave actual requerida').max(128),
    newPassword: zod_1.z
        .string()
        .min(4, 'La nueva clave debe tener al menos 4 caracteres')
        .max(128),
});
async function changePassword(userId, data) {
    const { currentPassword, newPassword } = changePasswordSchema.parse(data);
    if (currentPassword === newPassword) {
        throw new error_handler_1.AppError(400, 'La nueva clave debe ser distinta a la actual');
    }
    const user = await prisma_1.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        throw new error_handler_1.AppError(401, 'Usuario no encontrado');
    }
    const valid = await bcryptjs_1.default.compare(currentPassword, user.passwordHash);
    if (!valid) {
        throw new error_handler_1.AppError(400, 'La clave actual es incorrecta');
    }
    const passwordHash = await bcryptjs_1.default.hash(newPassword, 10);
    await prisma_1.prisma.user.update({
        where: { id: userId },
        data: { passwordHash },
    });
    return { message: 'Contraseña actualizada' };
}
async function ensureAdminUser(username = 'admin', password = 'admin123') {
    const passwordHash = await bcryptjs_1.default.hash(password, 10);
    const normalized = username.toLowerCase();
    await prisma_1.prisma.user.upsert({
        where: { username: normalized },
        create: {
            username: normalized,
            passwordHash,
            role: client_1.UserRole.admin,
        },
        update: {},
    });
}
//# sourceMappingURL=auth.service.js.map