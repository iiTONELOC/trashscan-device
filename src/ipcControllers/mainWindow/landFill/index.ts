import fs from 'fs';
import path from 'path';
import { ipcMain } from 'electron';
import { appDataFolderPath } from '../../../utils';
import landfillAPI from '../../../backend/landfill/API';


const scannedFolder = path.resolve(appDataFolderPath, './_scanned');
const scannedFilePath = path.resolve(scannedFolder, './scanned.json');

const getScannedList = () => {
    // check if the scanned folder exists
    if (!fs.existsSync(scannedFolder)) {
        // if it doesn't, create it
        fs.mkdirSync(scannedFolder, { recursive: true });
    }

    // if it does, check if the scanned.json file exists
    if (!fs.existsSync(scannedFilePath)) {
        // if it doesn't, create it
        fs.writeFileSync(scannedFilePath, JSON.stringify([]));
    }

    const scannedList = JSON.parse(fs.readFileSync(scannedFilePath, 'utf-8'));

    return scannedList;
};

const handlers = () => {
    ipcMain.handle('landFill-login-to-upc-server', async () => await landfillAPI.logInToUPCServer());
    ipcMain.handle('landFill-add-item-to-users-default-list', async (_, item: string): Promise<any> => {
        const data = await landfillAPI.addItemToUsersDefaultList(item);
        return data;
    });
    ipcMain.handle('landFill-get-scanned-list', () => {
        const scannedList = getScannedList();
        return scannedList;
    });
    ipcMain.handle('landFill-add-item-to-scanned-list', (_, item: string) => {
        const scannedList = getScannedList();
        scannedList.push(item);
        fs.writeFileSync(scannedFilePath, JSON.stringify(scannedList));
        return scannedList;
    });
}

export default handlers;
