import fs from 'fs';
import path from 'path';
import { getSalt, generateEncryptionKey, encrypt, decrypt } from '.';

describe('_crypto utilities', () => {
    const testData = 'This is some test data';
    const testPassword = 'password';

    describe('getSalt', () => {
        it('should be defined', () => {
            expect(getSalt).toBeDefined();
        });

        const salt = getSalt();

        it('should return a string', () => {
            expect(typeof salt).toBe('string');
        });

        it('should return a string of length 32', () => {
            expect(salt.length).toBe(32);
        });

        it('should return the same salt when called again', () => {
            expect(getSalt()).toBe(salt);
        });
    });

    describe('generateEncryptionKey', () => {
        it('should be defined', () => {
            expect(generateEncryptionKey).toBeDefined();
        });

        it('should return a promise', () => {
            expect(generateEncryptionKey('password')).toBeInstanceOf(Promise);
        });

        it('should return a Promise that resolves to a Buffer', async () => {
            const key = await generateEncryptionKey('password');
            expect(key).toBeInstanceOf(Buffer);
        });

        it('Should have a Buffer with a length of 32', async () => {
            const key = await generateEncryptionKey('password');
            expect(key.length).toBe(32);
        });

        it('Should return a different buffer when called again', async () => {
            const key1 = await generateEncryptionKey('password');
            const key2 = await generateEncryptionKey('password');
            expect(key1).not.toBe(key2);
        });

        it('Should return a different buffer when called with different passwords', async () => {
            const key1 = await generateEncryptionKey('password1');
            const key2 = await generateEncryptionKey('password2');
            expect(key1).not.toBe(key2);
        });

        it('should throw an error when called with an empty password', async () => {
            await expect(generateEncryptionKey('')).rejects.toThrow();
        });

        it('should generate a pepper if the environment variable is empty', async () => {
            const pepper = process.env.PEPPER;
            // reset the pepper so a new one is generated
            process.env.PEPPER = '';
            const key = await generateEncryptionKey('password');

            expect(key).toBeInstanceOf(Buffer);
            expect(key.length).toBe(32);
            expect(key.toString('hex')).not.toBe(pepper);

            // reset the pepper to the original value
            process.env.PEPPER = pepper;
            const rootDir = process.cwd();
            const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
            const envFilePath = path.join(rootDir, envFile);

            // remove all instances of the variable PEPPER from the .env file
            const currentEnvs = fs.readFileSync(envFilePath, 'utf8').split('\n');
            const newEnvs = currentEnvs.filter(env => !env.startsWith('PEPPER=')).filter(env => env !== '');

            // add the existing pepper to the .env file
            newEnvs.push(`PEPPER=${pepper}`);
            fs.writeFileSync(envFilePath, newEnvs.join('\n') + '\n');
        });
    });

    describe('encrypt', () => {
        it('should be defined', () => {
            expect(encrypt).toBeDefined();
        });

        it('should return a promise', () => {
            expect(encrypt(testData, testPassword)).toBeInstanceOf(Promise);
        });

        it('that promise should resolve to an object with iv and encryptedData properties', async () => {
            const { iv, encryptedData } = await encrypt(testData, testPassword);
            expect(iv).toBeDefined();
            expect(encryptedData).toBeDefined();
        });

        it('that iv should be a string', async () => {
            const { iv } = await encrypt(testData, testPassword);
            expect(typeof iv).toBe('string');
        });

        it('that iv should have a length of 32', async () => {
            const { iv } = await encrypt(testData, testPassword);
            expect(iv.length).toBe(32);
        });

        it('that encryptedData should be a string', async () => {
            const { encryptedData } = await encrypt(testData, testPassword);
            expect(typeof encryptedData).toBe('string');
        });

        it('that encryptedData should be not equal to the original data', async () => {
            const { encryptedData } = await encrypt(testData, testPassword);
            expect(encryptedData).not.toBe(testData);
        });

        it('should accept a prebuilt encryption key', async () => {
            const key = await generateEncryptionKey(testPassword);
            const { iv, encryptedData } = await encrypt(testData, testPassword, key);
            expect(iv).toBeDefined();
            expect(encryptedData).toBeDefined();
        });
    });

    describe('decrypt', () => {
        it('should be defined', () => {
            expect(decrypt).toBeDefined();
        });

        it('It should return a string that should be equal to the original data', async () => {
            const encrypted = await encrypt(testData, testPassword);
            const encrypted2 = await encrypt(testData, testPassword);

            const decryptedData = await decrypt(encrypted, testPassword);
            expect(decryptedData).toBe(testData);
            expect(decryptedData).not.toBe(encrypted);
            expect(typeof decryptedData).toBe('string');

            const decryptedData2 = await decrypt(encrypted2, testPassword);
            expect(decryptedData2).toBe(testData);
            expect(decryptedData2).not.toBe(encrypted2);
            expect(typeof decryptedData2).toBe('string');
        });

        it('should accept a prebuilt encryption key', async () => {
            const key = await generateEncryptionKey(testPassword);
            const encrypted = await encrypt(testData, testPassword, key);

            const decryptedData = await decrypt(encrypted, testPassword, key);
            expect(decryptedData).toBe(testData);
            expect(decryptedData).not.toBe(encrypted);
            expect(typeof decryptedData).toBe('string');
        });
    });
});
