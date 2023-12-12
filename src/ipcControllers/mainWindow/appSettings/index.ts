import { ipcMain } from 'electron';
import { getEncryptionKey } from '../session';
import { ISettings } from '../../../backend/db/models';
import { AppSettingsController } from '../../../backend/db/controllers';


/**
 * Allows for the password to be bypassed for setting the required settings, this is more convenient for the user
 * and less intrusive.
 * @param key : The key of the setting to add
 * @param value : The value of the setting to add
 * @param password : The password for the encryption key or an empty string
 * @returns true if the setting was added successfully, false otherwise
 */
const handleAddSetting = async (key: string, value: ISettings, password: string) => {
    let didCreate = false;

    const temp = Object.create({});
    temp[key] = value;


    if (!password || password === '') {
        didCreate = await AppSettingsController
            .createAppSetting(key, temp, '', getEncryptionKey() as Buffer);
    } else {
        didCreate = await AppSettingsController
            .createAppSetting(key, temp, password);
    }

    return didCreate;
}

// DO NOT USE THE SESSION KEY HERE
// USERS MUST ENTER THEIR PASSWORD TO ACCESS THESE SETTINGS [EXCEPT FOR SETTING NEW VARIABLES]
const handlers = () => {
    /**
     * Gets a list of all the settings keys.
     * @returns a promise that resolves with an array of all the settings keys.
    */
    ipcMain.handle('appSettings-get-settings', async (_) => await AppSettingsController.getAppSettingKeys());
    /**
     * Retrieves an encrypted setting from the database.
     * @param key The key of the setting to get.
     * @returns An encrypted setting object.
     */
    ipcMain.handle('appSettings-get-setting', async (_, key: string) => await AppSettingsController.getAppSetting(key));
    /**
     * Retrieves a decrypted setting from the database and decrypts it using the provided password.
     * @param key The key of the setting to get.
     * @param password the encryption key password.
     * @returns a promise that resolves with the decrypted setting or null if the password was incorrect.
    */
    ipcMain.handle('appSettings-get-setting-decrypted', async (_, key: string, password: string) => await AppSettingsController.getAppSettingDecrypted(key, password));
    // WE BREAK OUR OWN RULE HERE BUT IT REALLY ISN'T NECESSARY TO HAVE THE USER ENTER THEIR PASSWORD TO SET THESE VARIABLES,
    // ARGUABLY IT IS LESS SECURE BUT WE DONT VERIFY THE PASSWORD HERE SO IT DOESN'T REALLY MATTER
    /**
     * Adds a setting to the database.
     * @param key the key of the setting to add.
     * @param value the value of the setting to add.
     * @param password the password for the encryption key. This is optional, since settings are added
     * in plain text, the session encryption key will be used if a password is not provided.
     * @returns a promise that resolves to true if the setting was added successfully, otherwise false.
    */
    ipcMain.handle('appSettings-add-setting', async (_, key: string, value: ISettings, password: string) => await handleAddSetting(key, value, password));
    /**
     * Update a setting's value in the database.
     * @param key the key of the setting to update.
     * @param value the new value of the setting to update.
     * @param password the password for the encryption key. This is not optional. Since the setting has already been added,
     * the password is required to update the setting.
     * @returns a promise that resolves to true if the setting was updated successfully, otherwise false.
    */
    ipcMain.handle('appSettings-update-setting', async (_, key: string, value: ISettings, password: string) => await AppSettingsController.updateAppSetting(key, value, password));
};

export default handlers;
