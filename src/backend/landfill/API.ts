import { getEncryptionKey, getLoggedInUser } from '../../ipcControllers';
import { decrypt } from '../utils/_crypto';

const fiftyMinutes = 50 * 60 * 1000;

class LandFillAPI {
    private authToken = '';
    private authTokenExpiresIn: number = fiftyMinutes;
    private readonly upcServerURL: string = process.env.NODE_ENV === 'production' ?
        'https://the-landfill.herokuapp.com/graphql' : 'http://localhost:3001/graphql';


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

        const loginResponse = await fetch(this.upcServerURL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginMutation)
        });

        const loginResponseJSON = await loginResponse.json();
        const { data } = loginResponseJSON;


        const token = data?.loginUserDevice?.token;

        if (token) {
            this.authToken = token;

            // set a timer to refresh the token

            setTimeout(() => {
                this.authTokenExpiresIn = fiftyMinutes;
                this.logInToUPCServer();
            }, this.authTokenExpiresIn - 1000);
            return true;
        }

        return false;
    }

    async addItemToUsersDefaultList(barcode: string) {
        const addItemMutation = {
            operationName: 'addItemToDefaultList',
            query: `mutation addItemToDefaultList($barcode: String!) {addItemToDefaultList(barcode: $barcode)
                 {_id isCompleted listId notes quantity product {_id productAlias productData {barcode name}}}}`,
            variables: { barcode }
        };


        const addItemResponse = await fetch(this.upcServerURL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `${this.authToken}` },
            body: JSON.stringify(addItemMutation)
        });

        const addItemResponseJSON = await addItemResponse.json();



        const { data } = addItemResponseJSON;
        const { addItemToDefaultList } = data;


        return addItemToDefaultList;
    }
}

export const landfillAPI = new LandFillAPI();

export default landfillAPI;
