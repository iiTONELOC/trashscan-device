import {IUserEncrypted} from '../db/models';
import {decrypt, getOrCreateEnv} from '../utils/_crypto';
import {checkDeviceKeyExpired, loginMutation, upcServerURL} from './helpers';
import {getEncryptionKey, getLoggedInUser} from '../../ipcControllers';

const DEVICE_KEY_EXPIRES = 'DEVICE_KEY_EXPIRES';

class LandFillAPI {
  authToken = '';
  lastRefreshed = 0;
  fiftyMinutes = 50 * 60 * 1000;
  timeOut: NodeJS.Timeout | null = null;
  authTokenExpiresIn: number = this.fiftyMinutes;

  async logInToUPCServer(): Promise<boolean> {
    const currentUser: IUserEncrypted = getLoggedInUser();
    const encryptionKey = getEncryptionKey() ?? Buffer.from(process.env.AUTO_LOGIN_KEY, 'hex');

    // to login we need username, password and deviceID, as the deviceKey
    const decryptedPassword = await decrypt(currentUser.password, '', encryptionKey);
    let decryptedDeviceKey = await decrypt(currentUser.deviceID, '', encryptionKey);

    //check to see if the deviceKey is expired
    const deviceKeyExpires = getOrCreateEnv(DEVICE_KEY_EXPIRES);

    // if the env exists then check if the device key is expired
    if (deviceKeyExpires) {
      decryptedDeviceKey =
        (await checkDeviceKeyExpired(
          deviceKeyExpires,
          decryptedDeviceKey,
          currentUser,
          decryptedPassword,
        )) ?? decryptedDeviceKey;
    } else {
      console.log('Device Key Expires not found in env');
      return false;
    }

    const lm = loginMutation(currentUser.username, decryptedPassword, decryptedDeviceKey);

    const loginResponse = await fetch(upcServerURL(), {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(lm),
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
      console.log('Token is stale, logging in again...');
      await this.logInToUPCServer();
    }

    const addItemMutation = {
      operationName: 'addItemToDefaultList',
      query: `mutation addItemToDefaultList($barcode: String!) {addItemToDefaultList(barcode: $barcode)
                 {_id isCompleted listId notes quantity product {_id productAlias productData {barcode name}}}}`,
      variables: {barcode},
    };

    try {
      const addItemResponse = await fetch(upcServerURL(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${this.authToken}`,
        },
        body: JSON.stringify(addItemMutation),
      });

      const addItemResponseJSON = await addItemResponse.json();

      console.log('Add Item Response\n', addItemResponseJSON);

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
