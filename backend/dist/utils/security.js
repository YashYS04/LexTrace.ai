"use strict";
/**
 * LexTrace AI - Security & Privacy Module
 * Provides PII Redaction, Input Sanitization, and Prompt Injection Defense.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityGuard = void 0;
class SecurityGuard {
    // Regex patterns for sensitive PII identification
    static EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b/g;
    static PHONE_REGEX = /\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g;
    static SSN_REGEX = /\b\d{3}-\d{2}-\d{4}\b/g;
    static CC_REGEX = /\b(?:\d{4}[-\s]?){3}\d{4}\b/g;
    static ADDRESS_REGEX = /\b\d{1,5}\s+[\w\s]{2,25}(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Way|Terrace|Apt|Suite)\b/gi;
    static MONEY_REGEX = /\$[\d,]+(?:\.\d{2})?\b/g;
    // Patterns indicating malicious prompt injection or system override attempts
    static INJECTION_PATTERNS = [
        /ignore\s+(?:all\s+)?(?:previous|prior)\s+instructions/i,
        /disregard\s+(?:all\s+)?(?:previous|prior)\s+instructions/i,
        /system\s+prompt\s+override/i,
        /you\s+are\s+now\s+in\s+developer\s+mode/i,
        /reveal\s+your\s+(?:secret|system)\s+prompt/i,
        /output\s+the\s+above\s+text/i,
        /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
        /javascript:/gi,
    ];
    /**
     * Anonymize Personally Identifiable Information (PII) before LLM transmission.
     */
    static anonymizePII(text) {
        let sanitized = text;
        let count = 0;
        const typesFound = new Set();
        if (this.EMAIL_REGEX.test(sanitized)) {
            sanitized = sanitized.replace(this.EMAIL_REGEX, () => {
                count++;
                typesFound.add('EMAIL');
                return '[REDACTED_EMAIL]';
            });
        }
        if (this.PHONE_REGEX.test(sanitized)) {
            sanitized = sanitized.replace(this.PHONE_REGEX, () => {
                count++;
                typesFound.add('PHONE');
                return '[REDACTED_PHONE]';
            });
        }
        if (this.SSN_REGEX.test(sanitized)) {
            sanitized = sanitized.replace(this.SSN_REGEX, () => {
                count++;
                typesFound.add('SSN');
                return '[REDACTED_SSN]';
            });
        }
        if (this.CC_REGEX.test(sanitized)) {
            sanitized = sanitized.replace(this.CC_REGEX, () => {
                count++;
                typesFound.add('CREDIT_CARD');
                return '[REDACTED_CARD]';
            });
        }
        if (this.ADDRESS_REGEX.test(sanitized)) {
            sanitized = sanitized.replace(this.ADDRESS_REGEX, () => {
                count++;
                typesFound.add('ADDRESS');
                return '[REDACTED_ADDRESS]';
            });
        }
        return {
            sanitizedText: sanitized,
            redactedCount: count,
            piiTypesFound: Array.from(typesFound),
        };
    }
    /**
     * Check for adversarial prompt injection vectors.
     */
    static detectPromptInjection(input) {
        for (const pattern of this.INJECTION_PATTERNS) {
            if (pattern.test(input)) {
                return {
                    isSuspicious: true,
                    matchedPattern: pattern.toString(),
                };
            }
        }
        return { isSuspicious: false };
    }
    /**
     * Strip unsafe HTML/script tags and normalize whitespace.
     */
    static sanitizeInput(input) {
        return input
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
            .trim();
    }
    /**
     * Enclose user contract content inside an immutable boundary delimiter for LLM prompts.
     */
    static wrapInBoundary(content, boundaryId = 'LEGAL_DOC_CONTENT') {
        return `<<<START_${boundaryId}>>>\n${content}\n<<<END_${boundaryId}>>>`;
    }
}
exports.SecurityGuard = SecurityGuard;
