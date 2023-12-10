import { ipcMain } from 'electron';
import { IUserEncrypted, IUser } from '../../../backend/db/models';
import { generateEncryptionKey } from '../../../backend/utils/_crypto';
import { AppSettingsController, UserController } from '../../../backend/db/controllers';

/**
 * Requirements for logging a user into the session.
 */
export interface ILoginArgs {
    /**
     * The username to login with.
     */
    username: string;
    /**
     * The password for the encryption key.
     */
    encryptionPassword: string;
}

let loggedInUser: IUserEncrypted | null = null;
let encryptionKey: Buffer | null = null;

export function getEncryptionKey() {
    return encryptionKey;
}

export function setEncryptionKey(key: Buffer) {
    encryptionKey = key;
}

export function sessionLogout() {
    loggedInUser = null;
}

/**
 * Logs a user into the session, registers their
 * Session Encryption Key, and registers
 * encrypted app settings in the local environment
 *
 * @param user The user object to encrypt and store in the session
 * @param encryptionPassword The password to encrypt the user with
 */
export async function sessionLogin(user: IUser, encryptionPassword: string) {
    loggedInUser = await UserController.encryptUser(user, encryptionPassword);

    /**Add the app settings to the environment variables */
    const settingKeys = await AppSettingsController.getAppSettingKeys();

    for (const key of settingKeys) {
        const decryptedSetting = await AppSettingsController.getAppSettingDecrypted(key, encryptionPassword);
        const setting = decryptedSetting && Object.values(decryptedSetting)[0];
        setting && (process.env[key] = setting);
    }
}

const handlers = () => {
    /**
     * Allows for the encrypted user object to be accessed, this is useful for verification purposes.
     * @returns A promise that resolves with an encrypted user object if a user is logged in, otherwise null.
    */
    ipcMain.handle('session-get-logged-in-user', () => loggedInUser);
    /**
     * Attempts to login to the session.The encrypted user object is then saved into the session.
     * This is done in-memory only and is not persisted to the database.
     * @param args the username and password to login with.
     * @returns a promise that resolves to true if the user was logged in, otherwise false.
    */
    ipcMain.handle('session-login', async (_, args: ILoginArgs): Promise<boolean> => {
        const { username, encryptionPassword }: ILoginArgs = args;
        const user = await UserController.getUserBy.username(username, encryptionPassword);

        user && (await sessionLogin(user, encryptionPassword));
        user && (encryptionKey = await generateEncryptionKey(encryptionPassword));
        return user ? true : false;
    });
    /**
     * Logs the user out out of the session.
     * @returns A promise that resolves to nothing.
    */
    ipcMain.handle('session-logout', sessionLogout);
};

export default handlers;
