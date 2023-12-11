import { IDB, readDB, writeToDB } from '../../';
import { dbNotFoundErrorMsg, verifyUser } from '../userController';
import { encrypt, decrypt, generateEncryptionKey } from '../../../utils/_crypto';
import { ISettingsEncrypted, ISettings, appSettings as Settings, IEncryptionData } from '../../models';



/**
 * Decrypts an app setting into a plain text string
 * @param setting The encrypted setting object to decrypt
 * @param password The encryption password
 * @param encryptionKey The optional encryption key
 * @returns The decrypted setting as a plain text string
 */
export const decryptAppSetting = async (setting: ISettingsEncrypted, password: string, encryptionKey?: Buffer): Promise<ISettings> => {
    const key: Buffer = encryptionKey ?? await generateEncryptionKey(password);
    const value: string = await decrypt(Object.values(setting)[0], '', key);

    return { [Object.keys(setting)[0]]: value };
};

/**
 * Encrypts an app setting into an encrypted object
 *
 * @param setting {key/value} The setting to encrypt
 * @param password The encryption password
 * @param encryptionKey The optional encryption key
 * @returns The encrypted setting object
 */
export const encryptAppSetting = async (setting: ISettings, password: string, encryptionKey?: Buffer): Promise<IEncryptionData> => {
    const key: Buffer = encryptionKey ?? await generateEncryptionKey(password);
    const value: IEncryptionData = await encrypt(Object.values(setting)[0], '', key);

    return value;
}

/**
 * Creates a new app setting, stores it in the database, and sets it in the environment variables
 *
 * @param key the string key for the setting, these should be unique
 * @param value the value of the setting
 * @param password the encryption password
 * @param encryptionKey The optional encryption key
 * @returns true if the setting was created successfully
 */
export const createAppSetting = async (key: string, value: ISettings, password: string, encryptionKey?: Buffer): Promise<boolean> => {
    try {
        const db: IDB | null = await readDB();
        if (!db) {
            throw new Error(dbNotFoundErrorMsg);
        }

        const isUser = await verifyUser(db, password);

        if (!isUser && !encryptionKey) return false

        const encryptedValue: IEncryptionData = await encryptAppSetting(value, password, encryptionKey);

        // update the db
        const { models } = db;
        models.AppSettings.settings = Settings.settings || {};
        Settings.setSetting(key, encryptedValue);

        writeToDB(db);

        // set the setting in the environment variables
        process.env[key] = Object.values(encryptedValue)[0];

        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}

/**
 * Gets an app setting from the database and returns it in encrypted form
 *
 * @param key the key of the setting to get
 * @returns the setting in encrypted form
 */
export const getAppSetting = async (key: string): Promise<IEncryptionData | null> => {
    const db: IDB | null = await readDB();
    if (!db) {
        throw new Error(dbNotFoundErrorMsg);
    }

    const { models } = db;
    const dbSettings = models.AppSettings.settings as ISettingsEncrypted;
    Settings.settings = dbSettings;

    const setting: IEncryptionData | undefined = Settings.getSetting(key);

    if (!setting) {
        return null;
    }

    return setting;
}

/**
 * Retrieves an app setting from the database and decrypts it
 *
 * @param key The key of the setting to get
 * @param password the password for the encryption key
 * @param encryptionKey The optional encryption key
 * @returns The decrypted setting as a plain text key/value pair
 */
export const getAppSettingDecrypted = async (key: string, password: string, encryptionKey?: Buffer): Promise<ISettings | null> => {
    const db: IDB | null = await readDB();
    if (!db) {
        throw new Error(dbNotFoundErrorMsg);
    }

    const isUser = await verifyUser(db, password);

    if (!isUser) return null

    const { models } = db;
    const dbSettings = models.AppSettings.settings as ISettingsEncrypted;
    Settings.settings = dbSettings;

    const setting: IEncryptionData | undefined = Settings.getSetting(key);
    if (!setting) {
        return null;
    }

    return await decryptAppSetting({ [key]: setting }, password, encryptionKey);
}

/**
 * Updates an app setting if it exists or creates it if it does not
 *
 * @param key The key of the setting to update
 * @param value the value to update the setting to
 * @param password the password for the encryption key
 * @returns true if the setting was updated successfully
 */
export const updateAppSetting = async (key: string, value: ISettings, password: string): Promise<boolean> => {
    try {
        const db: IDB | null = await readDB();
        if (!db) {
            throw new Error(dbNotFoundErrorMsg);
        }

        const isUser = await verifyUser(db, password);

        if (!isUser) return false

        // try to get the user and verify the password
        const encryptedValue: IEncryptionData = await encryptAppSetting(value, password);
        Settings.setSetting(key, encryptedValue);

        // update the db
        const { models } = db;
        models.AppSettings.settings = Settings.settings;

        writeToDB(db);

        return true
    } catch (error) {
        return true
    }
}


/**
 * Gets all of the app setting keys
 *
 * @returns An array of all of the app setting keys
 */
export const getAppSettingKeys = async (): Promise<string[]> => {
    const db: IDB | null = await readDB();
    if (!db) {
        throw new Error(dbNotFoundErrorMsg);
    }

    const { models } = db;
    const dbSettings = models.AppSettings.settings as { [key: string]: string };

    return dbSettings ? Object.keys(dbSettings) : [];
}





export default {
    getAppSettingDecrypted,
    getAppSettingKeys,
    decryptAppSetting,
    encryptAppSetting,
    createAppSetting,
    updateAppSetting,
    getAppSetting
}
