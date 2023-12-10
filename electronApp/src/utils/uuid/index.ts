import { randomBytes } from 'crypto';

/**
 * Creates a UUID 
 * @returns {string} - returns a UUID
 */
export const generateUUID = () => {
    const bytes = randomBytes(16);

    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;

    const hex = bytes.toString('hex').match(/(.{8})(.{4})(.{4})(.{4})(.{12})/);
    // istanbul ignore next
    hex?.shift();
    // istanbul ignore next
    return hex?.join('-') ?? '';
};
