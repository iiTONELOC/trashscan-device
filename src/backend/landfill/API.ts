import {IUserEncrypted} from '../db/models';
import {decrypt, getOrCreateEnv} from '../utils/_crypto';
import {addItemMutation, loginMutation} from './mutations';
import {checkDeviceKeyExpired, upcServerURL} from './helpers';
import {getEncryptionKey, getLoggedInUser} from '../../ipcControllers';

const DEVICE_KEY_EXPIRES = 'DEVICE_KEY_EXPIRES';

export interface IAddedItem {
  _id: string;
  isCompleted: boolean;
  listID: string;
  notes: string | null;
  quantity: number;
  product: {
    _id: string;
    productAlias: string | null;
    productData: {
      barcode: string[];
      name: string;
    };
  };
}

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
    let decryptedDeviceKey: string = await decrypt(currentUser.deviceID, '', encryptionKey);

    //check to see if the deviceKey is expired
    decryptedDeviceKey =
      (await checkDeviceKeyExpired(
        getOrCreateEnv(DEVICE_KEY_EXPIRES),
        decryptedDeviceKey,
        currentUser.username,
        decryptedPassword,
      )) ?? decryptedDeviceKey;

    if (!decryptedDeviceKey) return false;

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

  async addItemToUsersDefaultList(barcode: string): Promise<IAddedItem> {
    // check if the last refreshed time is greater than the token expiration time
    // if it is then we need to log in again
    if (this.lastRefreshed + this.authTokenExpiresIn < Date.now() || this.authToken === '') {
      await this.logInToUPCServer();
    }

    try {
      const addItemResponse = await fetch(upcServerURL(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${this.authToken}`,
        },
        body: JSON.stringify(addItemMutation(barcode)),
      });

      const {data} = await addItemResponse.json();
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
