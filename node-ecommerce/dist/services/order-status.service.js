"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ORDER_STATUS_LABELS = void 0;
exports.validateStatusTransition = validateStatusTransition;
const error_handler_1 = require("../middleware/error-handler");
const STATUS_ORDER = [
    'pendiente',
    'en_proceso',
    'atendido',
];
const ALLOWED_TRANSITIONS = {
    pendiente: ['en_proceso', 'atendido'],
    en_proceso: ['atendido', 'pendiente'],
    atendido: ['en_proceso', 'pendiente'],
};
function isBackward(from, to) {
    return STATUS_ORDER.indexOf(to) < STATUS_ORDER.indexOf(from);
}
function validateStatusTransition(from, to, reason) {
    if (from === to) {
        throw new error_handler_1.AppError(400, 'El pedido ya se encuentra en ese estado');
    }
    const allowed = ALLOWED_TRANSITIONS[from];
    if (!allowed.includes(to)) {
        throw new error_handler_1.AppError(400, `Transición no permitida de "${from}" a "${to}"`);
    }
    if (isBackward(from, to) && (!reason || reason.trim().length === 0)) {
        throw new error_handler_1.AppError(400, 'Se requiere un motivo (reason) para retroceder el estado del pedido');
    }
}
exports.ORDER_STATUS_LABELS = {
    pendiente: 'Pendiente',
    en_proceso: 'En proceso',
    atendido: 'Atendido',
};
//# sourceMappingURL=order-status.service.js.map