export * from './User';
export * from './Settings';

import { User } from './User';
import { appSettings } from './Settings';

export interface IEncryptionData {
    iv: string;
    encryptedData: string;
}

export default {
    User,
    AppSettings: appSettings,
}
