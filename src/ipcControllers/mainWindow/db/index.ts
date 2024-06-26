import {ipcMain} from 'electron';
import fs from 'fs';
import {envFilePath} from '../../../backend/utils/env';
import {sessionLogin, setEncryptionKey, getEncryptionKey} from '../session';
import {UserController} from '../../../backend/db/controllers';
import {generateEncryptionKey} from '../../../backend/utils/_crypto';
/**
 * Requirements for creating a user.
 */
export interface ICreateUserArgs {
  /**
   * The username to create the user with.
   */
  username: string;
  /**
   * The password for the user account.
   */
  password: string;
  /** The email for the user account. */
  email: string;
  /** The encryption password to create the encryption key. */
  encryptionPassword: string;
  /** The device ID to create the user with. */
  deviceID: string;
}

const handlers = () => {
  /**
   * Reads the database and returns all users.
   * @returns A promise that resolves with an array of encrypted user objects.
   */
  ipcMain.handle('db-read-users', async () => await UserController.readUsers());
  /**
   * Creates a user in the database.
   * @param args The arguments to create the user with.
   * @returns A promise that resolves with the user's ID.
   * @throws An error if the user or a user already exists.
   */
  ipcMain.handle('db-create-user', async (_, args: ICreateUserArgs): Promise<string | null> => {
    const {username, password, email, encryptionPassword, deviceID}: ICreateUserArgs = args;
    const user = await UserController.create(
      username,
      email,
      password,
      encryptionPassword,
      deviceID,
    );

    // set the expiration time for the device key which is 30 days from now into
    // process environment
    process.env.DEVICE_KEY_EXPIRES = (Date.now() + 30 * 24 * 60 * 60 * 1000).toString();
    // persist the device key expiration time to the .env file
    fs.appendFileSync(envFilePath(), `DEVICE_KEY_EXPIRES=${process.env.DEVICE_KEY_EXPIRES}\n`);

    user && setEncryptionKey(await generateEncryptionKey(encryptionPassword));
    user && (await sessionLogin(user, encryptionPassword, getEncryptionKey()));
    return user?.username ? user.username : null;
  });
};

export default handlers;
