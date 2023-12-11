import _crypto from '.';
import { describe, expect, it } from '@jest/globals';

describe('_crypto utilities', () => {

    const testData = 'This is some test data';
    const testPassword = 'password';

    describe('getSalt', () => {
        it('should be defined', () => {
            expect(_crypto.getSalt).toBeDefined();
        });

        const salt = _crypto.getSalt();

        it('should return a string', () => {
            expect(typeof salt).toBe('string');
        });

        it('should return a string of length 32', () => {
            expect(salt.length).toBe(32);
        });

        it('should return the same salt when called again', () => {
            expect(_crypto.getSalt()).toBe(salt);
        });
    });

    describe('generateEncryptionKey', () => {
        it('should be defined', () => {
            expect(_crypto.generateEncryptionKey).toBeDefined();
        });

        it('should return a promise', () => {
            expect(_crypto.generateEncryptionKey('password')).toBeInstanceOf(Promise);
        });

        it('that promise should resolve to a Buffer', async () => {
            const key = await _crypto.generateEncryptionKey('password');
            expect(key).toBeInstanceOf(Buffer);
        });

        it('that Buffer should have a length of 32', async () => {
            const key = await _crypto.generateEncryptionKey('password');
            expect(key.length).toBe(32);
        });

        it('that Buffer should be different when called again', async () => {
            const key1 = await _crypto.generateEncryptionKey('password');
            const key2 = await _crypto.generateEncryptionKey('password');
            expect(key1).not.toBe(key2);
        });

        it('that Buffer should be different when called with different passwords', async () => {
            const key1 = await _crypto.generateEncryptionKey('password1');
            const key2 = await _crypto.generateEncryptionKey('password2');
            expect(key1).not.toBe(key2);
        });

        it('should throw an error when called with an empty password', async () => {
            await expect(_crypto.generateEncryptionKey('')).rejects.toThrow();
        });

        it('should generate a pepper if the environment variable is empty', async () => {
            const pepper = process.env.PEPPER;
            process.env.PEPPER = '';
            const key = await _crypto.generateEncryptionKey('password');
            expect(key).toBeInstanceOf(Buffer);
            expect(key.length).toBe(32);
            expect(key.toString('hex')).not.toBe(pepper);
            // set our pepper back
            process.env.PEPPER = pepper;
        });
    });

    describe('encrypt', () => {

        it('should be defined', () => {
            expect(_crypto.encrypt).toBeDefined();
        });

        it('should return a promise', () => {
            expect(_crypto.encrypt(testData, testPassword)).toBeInstanceOf(Promise);
        });

        it('that promise should resolve to an object with iv and encryptedData properties', async () => {
            const { iv, encryptedData } = await _crypto.encrypt(testData, testPassword);
            expect(iv).toBeDefined();
            expect(encryptedData).toBeDefined();
        });

        it('that iv should be a string', async () => {
            const { iv } = await _crypto.encrypt(testData, testPassword);
            expect(typeof iv).toBe('string');
        });

        it('that iv should have a length of 32', async () => {
            const { iv } = await _crypto.encrypt(testData, testPassword);
            expect(iv.length).toBe(32);
        });

        it('that encryptedData should be a string', async () => {
            const { encryptedData } = await _crypto.encrypt(testData, testPassword);
            expect(typeof encryptedData).toBe('string');
        });

        it('that encryptedData should be not equal to the original data', async () => {
            const { encryptedData } = await _crypto.encrypt(testData, testPassword);
            expect(encryptedData).not.toBe(testData);
        });

        it('should accept a prebuilt encryption key', async () => {
            const key = await _crypto.generateEncryptionKey(testPassword);
            const { iv, encryptedData } = await _crypto.encrypt(testData, testPassword, key);
            expect(iv).toBeDefined();
            expect(encryptedData).toBeDefined();
        });
    });

    describe('decrypt', () => {
        it('should be defined', () => {
            expect(_crypto.decrypt).toBeDefined();
        });

        it('It should return a string that should be equal to the original data', async () => {
            const encrypted = await _crypto.encrypt(testData, testPassword);
            const encrypted2 = await _crypto.encrypt(testData, testPassword);

            const decryptedData = await _crypto.decrypt(encrypted, testPassword);
            expect(decryptedData).toBe(testData);
            expect(decryptedData).not.toBe(encrypted);
            expect(typeof decryptedData).toBe('string');

            const decryptedData2 = await _crypto.decrypt(encrypted2, testPassword);
            expect(decryptedData2).toBe(testData);
            expect(decryptedData2).not.toBe(encrypted2);
            expect(typeof decryptedData2).toBe('string');
        });

        it('should accept a prebuilt encryption key', async () => {
            const key = await _crypto.generateEncryptionKey(testPassword);
            const encrypted = await _crypto.encrypt(testData, testPassword, key);

            const decryptedData = await _crypto.decrypt(encrypted, testPassword, key);
            expect(decryptedData).toBe(testData);
            expect(decryptedData).not.toBe(encrypted);
            expect(typeof decryptedData).toBe('string');
        });
    });


});