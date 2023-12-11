import AppSettingsController from './';
import { describe, expect, it } from '@jest/globals';

const {
    decryptAppSetting,
    encryptAppSetting
} = AppSettingsController;


describe('AppSettingsController', () => {
    it('Should be defined', () => {
        expect(AppSettingsController).toBeDefined();
    });

    describe('encryptAppSetting', () => {
        it('Should be defined', () => {
            expect(encryptAppSetting).toBeDefined();
        });

        it('Should be able to encrypt a setting', async () => {
            const setting = { test: 'test' };
            const password = 'password';
            const encryptedSetting = await encryptAppSetting(setting, password);

            expect(encryptedSetting).toBeDefined();
            expect(encryptedSetting).toHaveProperty('iv');
            expect(encryptedSetting).toHaveProperty('encryptedData');
        });
    });

    describe('decryptAppSetting', () => {
        it('Should be defined', () => {
            expect(decryptAppSetting).toBeDefined();
        });

        it('Should be able to decrypt a setting', async () => {
            const setting = { test: 'test' };
            const password = 'password';
            const encryptedSetting = await encryptAppSetting(setting, password);
            const decryptedSetting = await decryptAppSetting({ test: encryptedSetting }, password);

            expect(decryptedSetting).toBeDefined();
            expect(decryptedSetting).toHaveProperty('test');
            expect(decryptedSetting).toEqual(setting);
        });

        it('Should throw an error if the password is incorrect', async () => {
            const setting = { test: 'test' };
            const password = 'password';
            const encryptedSetting = await encryptAppSetting(setting, password);
            const wrongPassword = 'wrongPassword';

            try {
                await decryptAppSetting({ test: encryptedSetting }, wrongPassword);
            } catch (error) {
                expect(error).toBeDefined();
            }
        });
    });

    describe('createAppSetting', () => {
        it('Should be defined', () => {
            expect(AppSettingsController.createAppSetting).toBeDefined();
        });

        it('Should be able to create a setting', async () => {
            const setting = { test1: 'test' };
            const password = 'password';
            const key = 'test1';
            await AppSettingsController.createAppSetting(key, setting, password);

            const encryptedSetting = await AppSettingsController.getAppSetting(key);
            expect(encryptedSetting).toBeDefined();
            expect(encryptedSetting).toHaveProperty('iv');
        });
    });

    describe('getAppSetting', () => {
        it('Should be defined', () => {
            expect(AppSettingsController.getAppSetting).toBeDefined();
        });

        it('Should be able to get a setting and it should return it in an encrypted form', async () => {
            const setting = { test2: 'test' };
            const password = 'password';
            const key = 'test2';
            await AppSettingsController.createAppSetting(key, setting, password);

            const encryptedSetting = await AppSettingsController.getAppSetting(key);
            expect(encryptedSetting).toBeDefined();
            expect(encryptedSetting).toHaveProperty('iv');
        });
    });

    describe('getAppSettingDecrypted', () => {
        it('Should be defined', () => {
            expect(AppSettingsController.getAppSettingDecrypted).toBeDefined();
        });

        it('Should be able to get a setting and decrypt it', async () => {
            const setting = { test3: 'test' };
            const password = 'password';
            const key = 'test3';
            await AppSettingsController.createAppSetting(key, setting, password);

            const decryptedSetting = await AppSettingsController.getAppSettingDecrypted(key, password);
            expect(decryptedSetting).toBeDefined();
            expect(decryptedSetting).toHaveProperty('test3');
            expect(decryptedSetting).toEqual(setting);
        });
    });

    describe('updateAppSetting', () => {
        it('Should be defined', () => {
            expect(AppSettingsController.updateAppSetting).toBeDefined();
        });

        it('Should be able to update a setting', async () => {
            const setting = { test4: 'test' };
            const password = 'password';
            const key = 'test4';
            await AppSettingsController.createAppSetting(key, setting, password);

            const updatedSetting = { test4: 'test2' };

            await AppSettingsController.updateAppSetting(key, updatedSetting, password);

            const decryptedSetting = await AppSettingsController.getAppSettingDecrypted(key, password);

            expect(decryptedSetting).toBeDefined();
            expect(decryptedSetting).toHaveProperty('test4');
            expect(decryptedSetting).toEqual(updatedSetting);
        });
    });

    describe('getAppSettingKeys', () => {
        it('Should be defined', () => {
            expect(AppSettingsController.getAppSettingKeys).toBeDefined();
        });

        it('Should return a list of keys', async () => {
            const setting = { test5: 'test' };
            const password = 'password';
            const key = 'test5';
            await AppSettingsController.createAppSetting(key, setting, password);

            const keys = await AppSettingsController.getAppSettingKeys();

            expect(keys).toBeDefined();
            expect(keys).toEqual(['test1', 'test2', 'test3', 'test4', 'test5']);
        });
    });
});
