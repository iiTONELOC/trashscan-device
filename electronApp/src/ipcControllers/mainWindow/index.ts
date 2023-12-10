import ipcAppSettingsHandlers from './appSettings';
import ipcDbHandlers, { ICreateUserArgs } from './db';
import ipcSessionHandlers, { ILoginArgs } from './session';
import { ISettingsEncrypted, ISettings, IUserEncrypted } from '../../backend/db/models';


/**
 * Functions for the main process to invoke.
 * This API is exposed to the Main Window's renderer process via the context bridge
 * in the corresponding preload.ts script and allows for the renderer process to call
 * functions in the main process, which are isolated from each other.
 */
export interface IMainWindowIpcBridge {
    /**
     * Available Methods for the database.
     */
    db: {
        /**
         * Reads the database and returns all users.
         * @returns A promise that resolves with an array of encrypted user objects.
         */
        readUsers: () => Promise<IUserEncrypted>;

        /**
         * Creates a user in the database.
         * @param args The arguments to create the user with.
         * @returns A promise that resolves with the user's ID.
         * @throws An error if the user or a user already exists.
         */
        createUser: (args: ICreateUserArgs) => Promise<string | null>;
    };
    /**
     * Available Methods for the session.
     */
    session: {
        /**
         * Allows for the encrypted user object to be accessed, this is useful for verification purposes.
         * @returns A promise that resolves with an encrypted user object if a user is logged in, otherwise null.
         */
        getLoggedInUser: () => Promise<IUserEncrypted | null>;
        /**
         * Attempts to login to the session.The encrypted user object is then saved into the session.
         * This is done in-memory only and is not persisted to the database.
         * @param args the username and password to login with.
         * @returns a promise that resolves to true if the user was logged in, otherwise false.
         */
        login: (args: ILoginArgs) => Promise<boolean>;
        /**
         * Logs the user out out of the session.
         * @returns A promise that resolves to nothing.
         */
        logout: () => Promise<void>;
    };
    /**
     * Available Methods for the app settings.
     */
    appSettings: {
        /**
         * Gets a list of all the settings keys.
         * @returns a promise that resolves with an array of all the settings keys.
         */
        getSettings: () => Promise<string[]>;
        /**
         * Retrieves an encrypted setting from the database.
         * @param key The key of the setting to get.
         * @returns An encrypted setting object.
         */
        getSetting: (key: string) => Promise<ISettingsEncrypted>;
        /**
         * Retrieves a decrypted setting from the database and decrypts it using the provided password.
         * @param key The key of the setting to get.
         * @param password the encryption key password.
         * @returns a promise that resolves with the decrypted setting or null if the password was incorrect.
         */
        getSettingDecrypted: (key: string, password: string) => Promise<ISettings | null>;
        /**
         * Adds a setting to the database.
         * @param key the key of the setting to add.
         * @param value the value of the setting to add.
         * @param password the password for the encryption key. This is optional, since settings are added
         * in plain text, the session encryption key will be used if a password is not provided. If not providing a
         * password pass in an empty string.
         * @returns a promise that resolves to true if the setting was added successfully, otherwise false.
         */
        addSetting: (key: string, value: string, password: string) => Promise<boolean>;
        /**
         * Update a setting's value in the database.
         * @param key the key of the setting to update.
         * @param value the new value of the setting to update.
         * @param password the password for the encryption key. This is not optional. Since the setting has already been added,
         * the password is required to update the setting.
         * @returns a promise that resolves to true if the setting was updated successfully, otherwise false.
         */
        updateSetting: (key: string, value: string, password: string) => Promise<boolean>;
    }
}

export { default as ipcDbHandlers, ICreateUserArgs } from './db/index';
export { default as ipcAppSettingsHandlers } from './appSettings/index';
export { default as ipcSessionHandlers, ILoginArgs, sessionLogin, sessionLogout } from './session/index';

export default {
    ipcDbHandlers,
    ipcAppSettingsHandlers,
    ipcSessionHandlers
}
