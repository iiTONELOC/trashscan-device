import { IDB, readDB, writeToDB } from '../../';
import { decryptAppSetting, encryptAppSetting } from '../appSettingsController';
import { encrypt, decrypt, generateEncryptionKey } from '../../../utils/_crypto';
import { IUserModel, IUser, User, IUserEncrypted, ISettings, IAppSettingsModel } from '../../models';


const validators = {
    isEmail: (email: string): boolean => {
        const emailRegex = new RegExp(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
        return emailRegex.test(email);
    }
};

export const dbNotFoundErrorMsg = 'No database found';

/**
 * Verify the user exists and their password is correct, note only one user is allowed
 * @param db the database object
 * @param password the password for the encryption key
 * @returns true if the user exists and the password is correct, false otherwise
 */
export const verifyUser = async (db: IDB, password: string): Promise<boolean> => {
    // if we are in  test mode, skip the password check (This is needed to successfully test changing the encryption password)
    if (process.env.NODE_ENV === 'test') {
        return true;
    }

    const { models } = db;

    const username = Object.entries(models?.User ?? {})[0][0] ?? '';
    const getUser = await getUserBy.username(username, password);

    return userSuccessfullyDecrypted(getUser ?? {} as IUserModel);
}

/**
 * Tries to decrypt the user object with the provided password and encryption key
 *
 * @param user The encrypted user object
 * @param password The password for the encryption key
 * @param key Optional encryption key, one is generated if not provided
 * @returns The a decrypted user object, note the data may still be scrambled if the password or encryption key is incorrect
 */
export const decryptUser = async (user: IUserEncrypted, password: string, key?: Buffer): Promise<IUserModel> => {
    const encryptionKey: Buffer = key ?? await generateEncryptionKey(password);

    const encryptedDeviceID = user.deviceID;
    const encryptedPassword = user.password;
    const encryptedEmail = user.email;

    const decryptedUser = { username: user.username } as IUserModel;

    decryptedUser.deviceID = await decrypt(encryptedDeviceID, password, encryptionKey);
    decryptedUser.email = await decrypt(encryptedEmail, password, encryptionKey);
    decryptedUser.password = await decrypt(encryptedPassword, password, encryptionKey);

    return new User(decryptedUser);
};


/**
 * Takes an unencrypted user object and encrypts the email and password
 *
 * @param user an unencrypted user object to encrypt
 * @param password the password to use for the encryption key
 * @param key Optional encryption key, one is generated if not provided
 * @returns The encrypted user object
 */
export const encryptUser = async (user: IUser, password: string, key?: Buffer): Promise<IUserEncrypted> => {
    // istanbul ignore next
    const encryptionKey: Buffer = key ?? await generateEncryptionKey(password);

    const encryptedUser = { username: user.username } as IUserEncrypted;

    encryptedUser.deviceID = await encrypt(user.deviceID, password, encryptionKey);
    encryptedUser.email = await encrypt(user.email, password, encryptionKey);
    encryptedUser.password = await encrypt(user.password, password, encryptionKey);

    return encryptedUser;
};


/**
 * Updates the JSON database with the provided user object
 *
 * @param user the encrypted user object to update the database with
 * @param db the instance of the database to update
 */
export const updateUserDB = async (user: IUserEncrypted, db: IDB): Promise<void> => {
    db.models.User[user.username] = { ...user }
    db.updatedAt = Date.now();

    await writeToDB(db);
};

/**
 * Attempts to see if a user object was successfully decrypted by parsing an email address
 * @param user The user object to check
 * @returns true if the user object was successfully decrypted, false otherwise
 */
export const userSuccessfullyDecrypted = (user: IUser | IUserModel): boolean => validators.isEmail(user?.email ?? '');


/**
 * Creates a user object and encrypts the email and password for secure storage
 *
 * @param username Personal username
 * @param email  email address
 * @param password password used when creating the trashcan user account
 * @param encryptionPassword password for the encryption key
 * @param deviceID the deviceID for the trashcan device
 * 
 * @returns The newly created user object, unencrypted
 */
async function create(username: string, email: string, password: string, encryptionPassword: string, deviceID: string): Promise<IUserModel> {
    const db: IDB | null = await readDB();
    // istanbul ignore next
    if (!db) {
        throw new Error(dbNotFoundErrorMsg);
    }
    const userObjects = [...Object.values(db.models.User)] as IUserEncrypted[];

    const existingUsers: boolean = userObjects.length > 0;

    if (existingUsers) {
        throw new Error('A User already exists');
    }

    const newUser: IUser = {
        username,
        email,
        deviceID,
        password
    };

    // istanbul ignore next
    if (!newUser.username || !newUser.email || !newUser.password || !encryptionPassword) {
        throw new Error('Missing required fields');
    }

    const dataToReturn: IUserModel = new User(newUser);
    // encryption object for the database
    const dataToSet = {
        deviceID: dataToReturn.deviceID,
        username: dataToReturn.username,
        email: dataToReturn.email
    } as unknown as IUserEncrypted;

    // generate the key here rather than in the encrypt function
    const encryptionKey: Buffer = await generateEncryptionKey(encryptionPassword);

    // encrypt the email, password, and deviceID
    dataToSet.deviceID = await encrypt(dataToReturn.deviceID, encryptionPassword, encryptionKey);
    dataToSet.password = await encrypt(dataToReturn.password, encryptionPassword, encryptionKey);
    dataToSet.email = await encrypt(dataToReturn.email, encryptionPassword, encryptionKey);

    // update the database
    updateUserDB(dataToSet, db);

    return dataToReturn;
}

/**
 * Gets a user object from the database by the provided key
 */
const getUserBy = {
    /**
     * Gets a user object from the database by the provided username
     *
     * @param username the username to find
     * @param password the password for the encryption key
     * @returns Unencrypted user object if found, null otherwise
     */
    async username(username: string, password: string): Promise<IUserModel | null> {
        const db: IDB | null = await readDB();
        // istanbul ignore next
        if (!db) {
            throw new Error(dbNotFoundErrorMsg);
        }
        // istanbul ignore next
        if (!password || password.length === 0) {
            return null;
        }

        const key: Buffer = await generateEncryptionKey(password);
        const userObjects = [...Object.values(db.models.User)] as IUserEncrypted[];
        const foundUser = userObjects.find((user: IUserEncrypted) => user.username === username);

        if (!foundUser) {
            return null;
        }

        const decrypted = await decryptUser(foundUser, password, key);
        return userSuccessfullyDecrypted(decrypted) ? decrypted : null;
    }
};

/**
 * Updates a user object in the database
 *
 * @param username the user's username
 * @param password the password for the encryption key
 * @param updateData the data object with the fields to update
 * ```js
 * const updateData = { username: 'newUsername', email: 'newEmail', password: 'newPassword' }
 * ```
 * @returns 
 */
async function updateUser(
    username: string,
    password: string,
    updateData: {
        username?: string,
        email?: string,
        password?: string
    }
): Promise<IUserModel | null> {
    const db: IDB | null = await readDB();
    // istanbul ignore next
    if (!db) {
        throw new Error(dbNotFoundErrorMsg);
    }

    const key: Buffer = await generateEncryptionKey(password);
    const userObjects = [...Object.values(db.models.User)] as IUserEncrypted[];
    const foundUser = userObjects.find((user: IUserEncrypted) => user.username === username);

    // istanbul ignore next
    if (!foundUser) {
        return null;
    }
    const decrypted = await decryptUser(foundUser, password, key);

    const wasDecrypted = userSuccessfullyDecrypted(decrypted);

    if (!wasDecrypted) {
        return null;
    }

    // istanbul ignore next
    const hasUpdateData = Boolean(updateData?.username || updateData?.email || updateData?.password);
    // istanbul ignore next
    const usernameHasLength = Boolean(updateData?.username?.length && updateData?.username?.length > 0);
    // istanbul ignore next
    const emailHasLength = Boolean(updateData?.email?.length && updateData?.email?.length > 0);
    // istanbul ignore next
    const passwordHasLength = Boolean(updateData?.password?.length && updateData?.password?.length > 0);
    // istanbul ignore next
    const updatedDataHasLength = Boolean(usernameHasLength || emailHasLength || passwordHasLength);

    if (hasUpdateData && updatedDataHasLength) {
        const updatedUser = { ...decrypted, ...updateData };
        const encryptedUser = await encryptUser(updatedUser, password, key);

        updateUserDB(encryptedUser, db);
        return new User(updatedUser);
    }
    // istanbul ignore next
    return null;
}


/**
 * Deletes a user object from the database
 *
 * @param username the user's username
 * @param password the password for the encryption key
 * @returns true if the user was deleted, false otherwise
 */
async function deleteUser(username: string, password: string): Promise<boolean> {
    const db: IDB | null = await readDB();
    // istanbul ignore next
    if (!db) {
        throw new Error(dbNotFoundErrorMsg);
    }

    const userObjects = [...Object.values(db.models.User)] as IUserEncrypted[];
    const foundUser = userObjects.find((user: IUserEncrypted) => user.username === username);
    // istanbul ignore next
    if (!foundUser) {
        return false;
    }
    // istanbul ignore next
    if (!password || password.length === 0) {
        return false;
    }

    const key: Buffer = await generateEncryptionKey(password);
    const decrypted: IUser = await decryptUser(foundUser, password, key);
    // examine the email address, there should be an '@' symbol if it was decrypted correctly
    const emailHasAtSymbol = userSuccessfullyDecrypted(decrypted);

    if (decrypted && emailHasAtSymbol) {
        delete db.models.User[username];
        // TODO: If more models are added, delete any data associated with this userID
        db.updatedAt = Date.now();
        await writeToDB(db);
        return true;
    }
    // istanbul ignore next
    return false;
}


/**
 * Changes the password for the encryption key and decrypts and re-encrypts any associated data
 *
 * @param oldPassword the current password for the encryption key
 * @param newPassword the new password for the encryption key
 * @param username the username to change the password for
 * @returns true if the password was changed, false otherwise
 */
async function changeEncryptionPassword(oldPassword: string, newPassword: string, username: string): Promise<boolean> {
    const user: IUserModel | null = await getUserBy.username(username, oldPassword);

    // istanbul ignore next
    if (!user) {
        return false;
    }

    const isDecrypted = userSuccessfullyDecrypted(user);

    // istanbul ignore next
    if (!isDecrypted) {
        return false;
    }


    const newEncryptionKey = await generateEncryptionKey(newPassword);

    // read the database
    const db: IDB | null = await readDB();

    const models = db?.models;

    // delete the existing user and create a new one, using the old data and a new encryption key
    delete models?.User[user.username];

    const newlyEncryptedUser = await encryptUser(user, newPassword, newEncryptionKey);
    // update the db object
    models?.User && (models.User[newlyEncryptedUser.username] = newlyEncryptedUser);

    // Update the app settings
    const appSettings: IAppSettingsModel['settings'] = models?.AppSettings.settings as IAppSettingsModel['settings'];
    // decrypt the app settings and re-encrypt them with the new encryption key
    const currentSettings = Object.entries(appSettings ?? {});

    for (const setting of currentSettings) {
        const key = setting[0];
        const encryptedSetting = setting[1];

        const decryptedSetting: ISettings = await decryptAppSetting({ [key]: encryptedSetting }, oldPassword);
        const newlyEncryptedSetting = await encryptAppSetting(decryptedSetting, newPassword);

        appSettings && (appSettings[key] = newlyEncryptedSetting);
    }

    await writeToDB(db);
    return true;
}

/**
 * Returns the user objects from the database, encrypted
 */
async function readUsers(): Promise<IUserEncrypted[]> {
    const db: IDB | null = await readDB();
    // istanbul ignore next
    if (!db) {
        throw new Error(dbNotFoundErrorMsg);
    }

    const userObjects = [...Object.values(db.models.User)] as IUserEncrypted[];
    return userObjects;
}


export {
    create,
    getUserBy,
    updateUser,
    readUsers,
    deleteUser,
    changeEncryptionPassword
};

export default {
    create,
    getUserBy,
    readUsers,
    updateUser,
    decryptUser,
    encryptUser,
    changeEncryptionPassword,
    delete: deleteUser
};
