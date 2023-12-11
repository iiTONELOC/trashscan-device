import { IUserEncrypted } from '../../backend/db/models';

// eslint-disable-next-line
// @ts-ignore
const centralBridge = window.centralBridge;

const defaultRequiredMsg = 'Required for signing into the TrashScan API';

export const defaultApplicationSettings: {
    setting: string;
    description: string;
}[] = [
        { setting: 'username', description: defaultRequiredMsg },
        { setting: 'email', description: defaultRequiredMsg },
        { setting: 'deviceID', description: defaultRequiredMsg },
        { setting: 'password', description: defaultRequiredMsg }
    ];

export async function checkForUsers(): Promise<boolean> {
    const users = await centralBridge.db.readUsers();
    return users.length > 0;
}

export async function checkForLoggedInUser(): Promise<IUserEncrypted | null> {
    // eslint-disable-next-line
    // @ts-ignore
    return await centralBridge.session.getLoggedInUser();
}


export async function checkForAddedSettings(): Promise<{ found: boolean, missing: string[] }> {
    const settings = await centralBridge.appSettings.getSettings();
    let found = 0;
    const missing: string[] = [];

    for (const setting of settings) {
        if (defaultApplicationSettings.find(s => s.setting === setting)) {
            found++;
        }
    }

    // check for missing settings
    for (const defaultSetting of defaultApplicationSettings) {
        if (!settings.find((s: string) => s === defaultSetting.setting)) {
            missing.push(defaultSetting.setting);
        }
    }
    return {
        found: found === defaultApplicationSettings.length,
        missing
    }
}

export function getSettings(): Promise<string[]> {
    return centralBridge.appSettings.getSettings();
}

export async function getSetting(key: string): Promise<string> {
    const setting = await centralBridge.appSettings.getSetting(key);
    return setting
}

export async function setSetting(key: string, value: string): Promise<boolean> {
    return await centralBridge.appSettings.addSetting(key, value);
}

export async function getSettingDecrypted(key: string, password: string): Promise<string | null> {
    const setting = await centralBridge.appSettings.getSettingDecrypted(key, password);
    return setting
}

export const API = {
    checkForUsers,
    checkForLoggedInUser,
    checkForAddedSettings,
    getSettings,
    getSetting,
    setSetting,
    getSettingDecrypted
};

export default API;
