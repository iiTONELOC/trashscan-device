import { getEncryptionKey, getLoggedInUser } from '../../ipcControllers';
import { decrypt } from '../utils/_crypto';

let authToken = '';
let lastRefreshed = 0;
const fiftyMinutes = 50 * 60 * 1000;
let timeOut: NodeJS.Timeout | null = null;
let authTokenExpiresIn: number = fiftyMinutes;
const upcServerURL = (): string => process.env.NODE_ENV === 'production' ?
    'https://the-landfill.herokuapp.com/graphql' : 'http://localhost:3001/graphql';

class LandFillAPI {

    async logInToUPCServer(): Promise<boolean> {
        const currentUser = getLoggedInUser();
        const encryptionKey = getEncryptionKey() ?? Buffer.from(process.env.AUTO_LOGIN_KEY, 'hex');

        // to login we need username, password and deviceID, as the deviceKey

        const decryptedPassword = await decrypt(currentUser.password, '', encryptionKey);
        const decryptedDeviceKey = await decrypt(currentUser.deviceID, '', encryptionKey);

        const loginMutation = {
            operationName: 'loginUserDevice',
            query: 'mutation loginUserDevice($username: String!, $password: String!, $deviceKey: String!) {loginUserDevice(username: $username, password: $password, deviceKey: $deviceKey) {token user { _id  email username } }}',
            variables: {
                username: currentUser.username,
                password: decryptedPassword,
                deviceKey: decryptedDeviceKey
            }
        };

        const loginResponse = await fetch(upcServerURL(), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginMutation)
        });

        const loginResponseJSON = await loginResponse.json();
        const { data } = loginResponseJSON;

        // // log any errors
        // if (loginResponseJSON.errors) {
        //     console.log('LOGIN ERROR:', loginResponseJSON.errors);
        // }

        const token = data?.loginUserDevice?.token;

        if (token) {
            authToken = token;
            lastRefreshed = Date.now();
            // set a timer to refresh the token
            timeOut && clearTimeout(timeOut);

            timeOut = setTimeout(async () => {
                authTokenExpiresIn = fiftyMinutes;
                await this.logInToUPCServer();
            }, authTokenExpiresIn - 1000);
            return true;
        }

        return false;
    }

    async addItemToUsersDefaultList(barcode: string) {

        // ensure that we are logged in, if something interrupts the timeOut like a screen lock or something
        // we will need to ensure the token isn't stale

        // check if the last refreshed time is greater than the token expiration time
        // if it is then we need to log in again
        if (lastRefreshed + authTokenExpiresIn < Date.now() || !authToken || authToken === '') {
            // console.log('logging in again');
            await this.logInToUPCServer();
        }

        const addItemMutation = {
            operationName: 'addItemToDefaultList',
            query: `mutation addItemToDefaultList($barcode: String!) {addItemToDefaultList(barcode: $barcode)
                 {_id isCompleted listId notes quantity product {_id productAlias productData {barcode name}}}}`,
            variables: { barcode }
        };

        // console.log({ addItemMutation, authToken });

        const addItemResponse = await fetch(upcServerURL(), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `${authToken}` },
            body: JSON.stringify(addItemMutation)
        });

        // console.log({ addItemResponse });

        const addItemResponseJSON = await addItemResponse.json();

        // console.log({ addItemResponseJSON });
        // // log any errors
        // if (addItemResponseJSON.errors) {
        //     console.log(addItemResponseJSON.errors);
        // }
        // console.log()

        const { data } = addItemResponseJSON;
        const { addItemToDefaultList } = data;

        return addItemToDefaultList;
    }
}

export const landfillAPI = new LandFillAPI();

export default landfillAPI;
