import { IEncryptionData } from '../';

export interface ISettings {
    [key: string]: string;
}

export interface ISettingsEncrypted {
    [key: string]: IEncryptionData;
}

export interface IAppSettingsModel {
    settings: ISettingsEncrypted;

    setSetting(key: string, value: IEncryptionData): void;
    getSetting(key: string): IEncryptionData | undefined;
}


export class AppSettings implements IAppSettingsModel {
    settings: ISettingsEncrypted;

    constructor(settings?: ISettingsEncrypted) {
        this.settings = Object.create({});

        if (settings !== undefined) {
            this.settings = settings;
        }
    }

    setSetting(key: string, value: IEncryptionData) {
        this.settings = this.settings ?? Object.create({});
        try {
            this.settings[String(key)] = value;
        } catch (error) {
            console.error(error);
        }

    }

    getSetting(key: string): IEncryptionData | undefined {
        this.settings = this.settings ?? Object.create({});
        try {
            return this.settings[String(key)];
        } catch (error) {
            return undefined;
        }
    }
}

export const appSettings = new AppSettings();

export default appSettings;
