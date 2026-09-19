"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextExtractor = void 0;
const pdf_parse_1 = __importDefault(require("pdf-parse"));
const security_1 = require("../../utils/security");
class TextExtractor {
    /**
     * Extract raw text from text or PDF buffer.
     */
    static async extractText(buffer, mimeType) {
        if (mimeType === 'application/pdf') {
            try {
                const data = await (0, pdf_parse_1.default)(buffer);
                return security_1.SecurityGuard.sanitizeInput(data.text);
            }
            catch (err) {
                throw new Error(`Failed to parse PDF document: ${err.message}`);
            }
        }
        // Default to utf-8 text
        const text = buffer.toString('utf-8');
        return security_1.SecurityGuard.sanitizeInput(text);
    }
}
exports.TextExtractor = TextExtractor;
