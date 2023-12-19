import jsonData from '../package.json';
import * as os from 'os';
import * as path from 'path';

const appName = jsonData.productName;

const getAppDataDirectory = () => {
    switch (process.platform) {
        case 'darwin':
            return path.join(os.homedir(), 'Library', 'Application Support', appName);
        case 'win32':
            return path.join(process.env.APPDATA, appName);
        default:
            return path.join(os.homedir(), '.config', appName);
    }
};
export const appDataFolderPath = getAppDataDirectory();
