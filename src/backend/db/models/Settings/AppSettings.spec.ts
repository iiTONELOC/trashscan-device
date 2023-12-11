import { AppSettings } from './';
import { IEncryptionData } from '../';
import { describe, expect, it } from '@jest/globals';
import { encrypt, generateEncryptionKey } from '../../../utils/_crypto';


describe('AppSettings', () => {
    const testSettings = async () => {
        const encryptionKey = await generateEncryptionKey('password');
        const key1Data: IEncryptionData = await encrypt('This is a secret', '', encryptionKey);
        const key2Data: IEncryptionData = await encrypt('And I\'m not telling', '', encryptionKey);

        return {
            key1: key1Data,
            key2: key2Data
        }
    };

    it('should create a new instance of AppSettings', async () => {
        const appSettings = new AppSettings(await testSettings());
        expect(appSettings).toBeDefined();
        expect(appSettings).toBeInstanceOf(AppSettings);
    });

    it('should set a setting', async () => {
        const appSettings = new AppSettings(await testSettings());
        const newKey = 'newKey';
        const newValue: IEncryptionData = await encrypt('new value', '', await generateEncryptionKey('password'));

        appSettings.setSetting(newKey, newValue);
        expect(appSettings.getSetting(newKey)).toBe(newValue);
    });

    it('should return undefined for a non-existing setting', () => {
        const appSettings = new AppSettings();
        const nonExistingKey = 'nonExistingKey';

        expect(appSettings.getSetting(nonExistingKey)).toBeUndefined();
    });
});
