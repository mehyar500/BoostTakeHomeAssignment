import crypto from "node:crypto";

/**
 * Generate a 6-char Base-62 slug
 */
export const generateCode = (): string => {
    return crypto.randomBytes(4).toString("base64").replace(/[+/=]/g, "").substring(0, 6);
}