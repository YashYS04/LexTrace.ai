"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Hasher = void 0;
const crypto_1 = __importDefault(require("crypto"));
class Hasher {
    static sha256(content) {
        return crypto_1.default.createHash('sha256').update(content.trim().toLowerCase()).digest('hex');
    }
    static generateId(prefix = 'doc') {
        return `${prefix}_${crypto_1.default.randomBytes(8).toString('hex')}`;
    }
}
exports.Hasher = Hasher;
