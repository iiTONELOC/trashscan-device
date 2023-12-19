import { ipcMain } from 'electron';
import autoLogin from '../../../backend/autoLogin';
import landfillAPI from '../../../backend/landfill/API';
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

export function getLoggedInUser() {
    return loggedInUser;
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
 * @param encryptionKey The optional encryption key
 */
export async function sessionLogin(user: IUser, encryptionPassword: string, encryptionKey?: Buffer) {
    loggedInUser = await UserController.encryptUser(user, encryptionPassword, encryptionKey);

    /**Add the app settings to the environment variables */
    const settingKeys = await AppSettingsController.getAppSettingKeys();

    for (const key of settingKeys) {
        const decryptedSetting = await AppSettingsController.getAppSettingDecrypted(key, encryptionPassword, encryptionKey);
        const setting = decryptedSetting && Object.values(decryptedSetting)[0];
        setting && (process.env[key] = setting);
    }

    try {
        await landfillAPI.logInToUPCServer();
    } catch (err) {
        console.log(err);
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
        let user = await UserController.getUserBy.username(username, encryptionPassword);

        if (!user) return false;

        user && (await sessionLogin(user, encryptionPassword));
        user && (encryptionKey = await generateEncryptionKey(encryptionPassword));
        user = null;
        return true;
    });
    /**
     * Logs the user out out of the session.
     * @returns A promise that resolves to nothing.
    */
    ipcMain.handle('session-logout', sessionLogout);

    ipcMain.handle('session-enable-auto-login', async () => {
        autoLogin.enable(encryptionKey, loggedInUser);
        await landfillAPI.logInToUPCServer();
    });

    ipcMain.handle('session-disable-auto-login', async () => autoLogin.disable());

    ipcMain.handle('session-auto-login', async (): Promise<boolean> => autoLogin.autoLoginUser(sessionLogin, setEncryptionKey));
};

export default handlers;
