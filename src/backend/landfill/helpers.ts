import fs from 'fs';
import {envFilePath} from '../utils/env';
import {decrypt} from '../utils/_crypto';
import {reGenDeviceKeyMutation} from './mutations';
import {updateUser} from '../db/controllers/userController';
import {getEncryptionKey, getLoggedInUser} from '../../ipcControllers';
import {updateAppSetting} from '../db/controllers/appSettingsController';

/**
 * Fetch the URL of the UPC server depending on the environment
 * @returns the URL of the UPC server depending on the environment
 */
export const upcServerURL = (): string =>
  process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test'
    ? 'http://localhost:3001/graphql'
    : 'https://the-landfill.herokuapp.com/graphql';

/**
 * Checks if the device key is expired and refreshes it if it is
 *
 * @param deviceExpirationFromEnv the expiration time of the device key
 * @param decryptedDeviceKey the decrypted device key
 * @param username the username
 * @param decryptedPassword the clear text password
 * @returns the original device key if it is not expired, or the new device key if it is.
 * Returns undefined if the device key could not be refreshed
 */
export const checkDeviceKeyExpired = async (
  deviceExpirationFromEnv: string,
  decryptedDeviceKey: string,
  username: string,
  decryptedPassword: string,
): Promise<string | undefined> => {
  if (!deviceExpirationFromEnv) return undefined;
  // if the device key is within 1 day of expiring, refresh it
  const now = new Date();
  const oneDay = 24 * 60 * 60 * 1000;
  const thirtyDays = 30 * oneDay;

  const deviceKeyExpiresDate = new Date(parseInt(deviceExpirationFromEnv));
  const deviceKeyExpiredTime = deviceKeyExpiresDate.getTime();

  if (deviceKeyExpiredTime - now.getTime() < oneDay || deviceKeyExpiredTime < now.getTime()) {
    // refresh the device key
    const newDeviceKey = await reGenDeviceKey(decryptedDeviceKey);
    if (!newDeviceKey) return undefined;

    // we need to update the device key in the user object
    const updatedUser = await updateUser(username, decryptedPassword, {
      deviceID: newDeviceKey,
    });
    if (!updatedUser) return undefined;

    // update the app settings with the new device key
    const settingsUpdated = await updateAppSetting(
      'deviceID',
      {deviceID: newDeviceKey},
      decryptedPassword,
    );
    if (!settingsUpdated) return undefined;

    // update the expiration time for the device key which is 30 days from now
    process.env.DEVICE_KEY_EXPIRES = (Date.now() + thirtyDays).toString();
    // persist the changes to the .env file
    await updateDeviceKeyEnv();

    return newDeviceKey;
  } else {
    return decryptedDeviceKey;
  }
};

/**
 * Regenerates the device key for the device and updates the user object and the .env file
 * @param deviceKey
 * @returns the new device key or null if the device key could not be regenerated
 */
const reGenDeviceKey = async (deviceKey: string): Promise<string | null> => {
  try {
    const user = getLoggedInUser();
    const decryptedPassword = await decrypt(user.password, '', getEncryptionKey());
    const reGenMutation = reGenDeviceKeyMutation(deviceKey, {
      username: user.username,
      password: decryptedPassword,
    });
    const reGenResponse = await fetch(upcServerURL(), {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(reGenMutation),
    });

    const reGenResponseJSON = await reGenResponse.json();
    const {data} = reGenResponseJSON;

    return data?.regenerateDeviceKeyFromDevice;
  } catch (error) {
    console.error('Error regenerating device key!', error);
    return null;
  }
};

/**
 * Updates the .env file with the new device key expiration time
 * @returns a promise that resolves when the .env file has been updated
 */
const updateDeviceKeyEnv = async () => {
  return new Promise<void>((resolve, reject) => {
    try {
      // retrieve the contents of the .env file
      const envPath = envFilePath();
      const envs = fs.readFileSync(envFilePath(), 'utf8').split('\n');

      // strip out the old DEVICE_KEY_EXPIRES line if it exists
      const newEnvs = envs
        .filter(env => !env.includes('DEVICE_KEY_EXPIRES='))
        .filter(env => env.length);

      // update the DEVICE_KEY_EXPIRES line with the current expiration time
      const newEnv = `DEVICE_KEY_EXPIRES=${process.env.DEVICE_KEY_EXPIRES}\n`;
      const updatedEnvs = [...newEnvs, newEnv];

      // write the updated contents back to the .env file
      fs.writeFileSync(envPath, updatedEnvs.join('\n'));

      resolve();
    } catch (error) {
      reject(error as Error);
    }
  });
};
