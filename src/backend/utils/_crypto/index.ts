import crypto from 'crypto';
import {writeFileSync, readFileSync} from 'fs';
import {generateUUID} from '../uuid';
import {envFilePath} from '../env';

const _envPath = envFilePath();

export type EncryptionData = {
  iv: string;
  encryptedData: string;
};

/**
 *Looks for the requested environment variable, if it does not exist, it creates it and returns it
 *
 * @returns {string} - the generated or existing environment variable
 */
export function getOrCreateEnv(variable: string): string {
  let wantedVariable = process.env[variable];

  if (!wantedVariable) {
    const currentEnvs = readFileSync(_envPath, 'utf8')
      .split('\n')
      .filter(env => env !== '');

    // look for the variable in the .env file
    const varInFile = currentEnvs.find(env => env.split('=')[0].trim() === variable);

    if (varInFile) {
      wantedVariable = varInFile.split('=')[1].trim();
    } else {
      wantedVariable = generateUUID().replace(/-/g, '');
      writeFileSync(_envPath, `${variable}=${wantedVariable}\n`, {flag: 'a'});
    }

    process.env[variable] = wantedVariable;
  }

  return wantedVariable;
}

export const getSalt = (): string => getOrCreateEnv('SALT');
export const getPepper = (): string => getOrCreateEnv('PEPPER');

/**
 * Creates a key for symmetric encryption using the user provided password, a pepper, and a salt
 *
 * @param password the user provided password for encryption
 * @returns The encryption key as a buffer, this value is not stored anywhere
 * @rejects {Error} - rejects with an error if the encryption fails
 */
export const generateEncryptionKey = async (password: string): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    try {
      // istanbul ignore next
      const pepper: Buffer = Buffer.from(getPepper() ?? '', 'utf8');
      const salt: string = getSalt();

      // ensure that we have a pepper, a salt, and a password
      // if we do not have either of these, throw a relevant error message
      if (!pepper.length) {
        throw new Error('No pepper found');
      }
      if (!password.length) {
        throw new Error('No password found');
      }
      const key: Buffer = crypto.pbkdf2Sync(password + pepper, salt, 100000, 32, 'sha256');
      resolve(key);
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Encrypts the data using the provided password and encryption key
 *
 * @param data any serialized data
 * @param password the password to use for the encryption key
 * @param encryptionKey an optional encryption key, if not provided, one will be generated
 * @returns {Promise<EncryptionData>} - returns the encrypted data and the initialization vector
 * @rejects {Error} - rejects with an error if the encryption fails
 */
export const encrypt = async (
  data: string,
  password: string,
  encryptionKey?: Buffer,
): Promise<EncryptionData> => {
  return new Promise((resolve, reject) => {
    const encryptData = (encryptionKey: Buffer) => {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv('aes-256-ctr', encryptionKey, iv);
      const encryptedData = cipher.update(data, 'utf8', 'hex') + cipher.final('hex');
      resolve({iv: iv.toString('hex'), encryptedData});
    };

    if (encryptionKey) {
      try {
        encryptData(encryptionKey);
      } catch (error) {
        // istanbul ignore next
        reject(error);
      }
    } else {
      generateEncryptionKey(password)
        .then((key: Buffer) => {
          encryptData(key);
        })
        .catch(error => {
          // istanbul ignore next
          reject(error);
        });
    }
  });
};

/**
 * Decrypts the data using the provided password and encryption key
 *
 * @param encryptionData the encrypted data and initialization vector
 * @param password the password to use for the encryption key
 * @param encryptionKey an optional encryption key, if not provided, one will be generated
 * @returns {Promise<string>} - returns the decrypted data
 * @rejects {Error} - rejects with an error if the decryption fails
 */
export const decrypt = async (
  encryptionData: EncryptionData,
  password: string,
  encryptionKey?: Buffer,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const decryptData = (encryptionKey: Buffer) => {
      const decipher = crypto.createDecipheriv(
        'aes-256-ctr',
        encryptionKey,
        Buffer.from(encryptionData.iv, 'hex'),
      );
      const decryptedData =
        decipher.update(encryptionData.encryptedData, 'hex', 'utf8') + decipher.final('utf8');
      resolve(decryptedData);
    };

    if (encryptionKey) {
      try {
        decryptData(encryptionKey);
      } catch (error) {
        // istanbul ignore next
        reject(error);
      }
    } else {
      generateEncryptionKey(password)
        .then((key: Buffer) => {
          decryptData(key);
        })
        .catch(error => {
          // istanbul ignore next
          reject(error);
        });
    }
  });
};

// create a module that exports the function
export default {
  generateEncryptionKey,
  getSalt,
  encrypt,
  decrypt,
};
