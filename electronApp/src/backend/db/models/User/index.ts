import { IEncryptionData } from '../'


export interface IUser {
    email: string;
    username: string;
    password: string;
    deviceID: string;
}

export interface IUserEncrypted {
    username: string;
    email: IEncryptionData;
    password: IEncryptionData;
    deviceID: IEncryptionData;
}


export interface IUserModel extends IUser {
    setEmail(email: string): void;
    setUsername(username: string): void;
    setDeviceID(deviceID: string): void;
    setPassword(password: string): void;
    toJSON(): Partial<IUserModel>;
}


export class User implements IUserModel {
    username!: string;
    email!: string;
    deviceID!: string;
    password!: string;

    constructor(user: IUser) {
        this.setEmail(user.email);
        this.setDeviceID(user.deviceID);
        this.setUsername(user.username);
        this.setPassword(user.password);
    }

    setUsername(username: string) {
        if (!username) {
            throw new Error('No username found');
        }
        this.username = username;
    }

    setDeviceID(deviceID: string) {
        if (!deviceID) {
            throw new Error('No deviceID found');
        }
        this.deviceID = deviceID;
    }

    setEmail(email: string) {
        if (!email) {
            throw new Error('No email found');
        }
        this.email = email;
    }

    setPassword(password: string) {
        if (!password) {
            throw new Error('No password found');
        }
        this.password = password;
    }

    toJSON(): Partial<IUserModel> {
        return {
            email: this.email,
            username: this.username,
            deviceID: this.deviceID
        };
    }
}

export default User;
