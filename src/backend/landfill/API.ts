import {decrypt, getOrCreateEnv} from '../utils/_crypto';
import {updateUser} from '../db/controllers/userController';
import {getEncryptionKey, getLoggedInUser} from '../../ipcControllers';
import {updateAppSetting} from '../db/controllers/appSettingsController';

const regenDeviceKeyMutation = (deviceKey: string) => {
  return {
    operationName: 'RegenerateDeviceKey',
    query:
      'mutation RegenerateDeviceKeyFromDevice($deviceKey: String!) {\r\n  regenerateDeviceKeyFromDevice(deviceKey: $deviceKey)\r\n}',
    variables: {deviceKey},
  };
};

const regenDeviceKey = async (deviceKey: string): Promise<string | null> => {
  try {
    const regenMutation = regenDeviceKeyMutation(deviceKey);
    const regenResponse = await fetch('https://the-landfill.herokuapp.com/graphql', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(regenMutation),
    });

    const regenResponseJSON = await regenResponse.json();
    const {data} = regenResponseJSON;

    return data?.regenerateDeviceKeyFromDevice;
  } catch (error) {
    console.error('Error regenerating device key!', error);
    return null;
  }
};

class LandFillAPI {
  authToken = '';
  lastRefreshed = 0;
  fiftyMinutes = 50 * 60 * 1000;
  timeOut: NodeJS.Timeout | null = null;
  authTokenExpiresIn: number = this.fiftyMinutes;

  upcServerURL = (): string =>
    process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test'
      ? 'http://localhost:3001/graphql'
      : 'https://the-landfill.herokuapp.com/graphql';

  async logInToUPCServer(): Promise<boolean> {
    const currentUser = getLoggedInUser();
    const encryptionKey = getEncryptionKey() ?? Buffer.from(process.env.AUTO_LOGIN_KEY, 'hex');

    // to login we need username, password and deviceID, as the deviceKey

    const decryptedPassword = await decrypt(currentUser.password, '', encryptionKey);
    const decryptedDeviceKey = await decrypt(currentUser.deviceID, '', encryptionKey);

    //check to see if the deviceKey is expired
    const deviceKeyExpires = getOrCreateEnv('DEVICE_KEY_EXPIRES');

    if (deviceKeyExpires) {
      // if the device key is within 1 day of expiring, refresh it
      const deviceKeyExpiresDate = new Date(parseInt(deviceKeyExpires));
      const now = new Date();
      const oneDay = 24 * 60 * 60 * 1000;

      if (deviceKeyExpiresDate.getTime() - now.getTime() < oneDay) {
        // refresh the device key
        const newDeviceKey = await regenDeviceKey(decryptedDeviceKey);

        if (!newDeviceKey) return false;
        // we need to update the device key in the user object
        const updatedUser = await updateUser(currentUser.username, decryptedPassword, {
          deviceID: newDeviceKey,
        });

        if (!updatedUser) return false && console.log('Error updating user device key!');

        // update the app settings with the new device key
        const settingsUpdated = await updateAppSetting(
          'DeviceID',
          {deviceID: newDeviceKey},
          decryptedPassword,
        );

        if (!settingsUpdated)
          return false && console.log('Error updating app settings with new device key!');

        // update  the expiration time for the device key which is 30 days from now into
        process.env.DEVICE_KEY_EXPIRES = (Date.now() + 30 * 24 * 60 * 60 * 1000).toString();
        getOrCreateEnv('DEVICE_KEY_EXPIRES');
      }
    }

    const loginMutation = {
      operationName: 'loginUserDevice',
      query:
        'mutation loginUserDevice($username: String!, $password: String!, $deviceKey: String!) {loginUserDevice(username: $username, password: $password, deviceKey: $deviceKey) {token user { _id  email username } }}',
      variables: {
        username: currentUser.username,
        password: decryptedPassword,
        deviceKey: decryptedDeviceKey,
      },
    };

    const loginResponse = await fetch(this.upcServerURL(), {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(loginMutation),
    });

    const loginResponseJSON = await loginResponse.json();
    const {data} = loginResponseJSON;

    const token = data?.loginUserDevice?.token;

    if (token) {
      this.authToken = token;
      this.lastRefreshed = Date.now();
      // set a timer to refresh the token
      this.timeOut && clearTimeout(this.timeOut);

      this.timeOut = setTimeout(async () => {
        this.authTokenExpiresIn = this.fiftyMinutes;
        await this.logInToUPCServer();
      }, this.authTokenExpiresIn - 1000);
      return true;
    }

    return false;
  }

  async addItemToUsersDefaultList(barcode: string) {
    // ensure that we are logged in, if something interrupts the timeOut like a screen lock or something
    // we will need to ensure the token isn't stale

    // check if the last refreshed time is greater than the token expiration time
    // if it is then we need to log in again
    if (this.lastRefreshed + this.authTokenExpiresIn < Date.now() || this.authToken === '') {
      await this.logInToUPCServer();
    }

    const addItemMutation = {
      operationName: 'addItemToDefaultList',
      query: `mutation addItemToDefaultList($barcode: String!) {addItemToDefaultList(barcode: $barcode)
                 {_id isCompleted listId notes quantity product {_id productAlias productData {barcode name}}}}`,
      variables: {barcode},
    };

    try {
      const addItemResponse = await fetch(this.upcServerURL(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${this.authToken}`,
        },
        body: JSON.stringify(addItemMutation),
      });

      const addItemResponseJSON = await addItemResponse.json();

      const {data} = addItemResponseJSON;
      const {addItemToDefaultList} = data;

      return addItemToDefaultList;
    } catch (error) {
      console.error('Error adding item to default list!', error);
      return null;
    }
  }
}

export const landfillAPI = new LandFillAPI();

export default landfillAPI;
