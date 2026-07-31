"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toNumber = toNumber;
exports.roundMoney = roundMoney;
function toNumber(value) {
    return Number(value);
}
function roundMoney(value) {
    return Math.round(value * 100) / 100;
}
//# sourceMappingURL=decimal.js.map