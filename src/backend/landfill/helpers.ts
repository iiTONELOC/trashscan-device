import fs from 'fs';
import {envFilePath} from '../utils/env';
import {decrypt} from '../utils/_crypto';
import {IUserEncrypted} from '../db/models';
import {updateUser} from '../db/controllers/userController';
import {getEncryptionKey, getLoggedInUser} from '../../ipcControllers';
import {updateAppSetting} from '../db/controllers/appSettingsController';

export const loginMutation = (username: string, password: string, deviceKey: string) => {
  return {
    operationName: 'loginUserDevice',
    query:
      'mutation loginUserDevice($username: String!, $password: String!, $deviceKey: String!) {loginUserDevice(username: $username, password: $password, deviceKey: $deviceKey) {token user { _id  email username } }}',
    variables: {username, password, deviceKey},
  };
};

export const upcServerURL = (): string =>
  process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test'
    ? 'http://localhost:3001/graphql'
    : 'https://the-landfill.herokuapp.com/graphql';

export const checkDeviceKeyExpired = async (
  deviceExpirationFromEnv: string,
  decryptedDeviceKey: string,
  currentUser: IUserEncrypted,
  decryptedPassword: string,
): Promise<string | undefined> => {
  // if the device key is within 1 day of expiring, refresh it
  const now = new Date();
  const oneDay = 24 * 60 * 60 * 1000;

  const deviceKeyExpiresDate = new Date(parseInt(deviceExpirationFromEnv));
  const deviceKeyExpiredTime = deviceKeyExpiresDate.getTime();

  if (deviceKeyExpiredTime - now.getTime() < oneDay || deviceKeyExpiredTime < now.getTime()) {
    // refresh the device key
    const newDeviceKey = await reGenDeviceKey(decryptedDeviceKey);
    if (!newDeviceKey) return undefined;

    // we need to update the device key in the user object
    const updatedUser = await updateUser(currentUser.username, decryptedPassword, {
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

    // update the expiration time for the device key which is 30 days from now into
    process.env.DEVICE_KEY_EXPIRES = (Date.now() + 30 * 24 * 60 * 60 * 1000).toString();
    await updateDeviceKeyEnv();

    return newDeviceKey;
  }
};

const reGenDeviceKeyMutation = (deviceKey: string, user: {username: string; password: string}) => {
  return {
    operationName: 'RegenerateDeviceKeyFromDevice',
    query:
      'mutation RegenerateDeviceKeyFromDevice($deviceKey: String!, $username: String!, $password: String!) {\r\n  regenerateDeviceKeyFromDevice(deviceKey: $deviceKey, username: $username, password: $password)\r\n}',
    variables: {deviceKey, username: user.username, password: user.password},
  };
};

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

const updateDeviceKeyEnv = async () => {
  // get the env file's contents to see if the DEVICE_KEY_EXPIRES env exists, if it does update it, if it doesn't append it

  return new Promise<void>((resolve, reject) => {
    try {
      const envPath = envFilePath();
      const envs = fs.readFileSync(envFilePath(), 'utf8').split('\n');
      const newEnvs = envs
        .filter(env => !env.includes('DEVICE_KEY_EXPIRES='))
        .filter(env => env.length);

      const newEnv = `DEVICE_KEY_EXPIRES=${process.env.DEVICE_KEY_EXPIRES}\n`;

      const updatedEnvs = [...newEnvs, newEnv];

      fs.writeFileSync(envPath, updatedEnvs.join('\n'));
      resolve();
    } catch (error) {
      reject(error as Error);
    }
  });
};
