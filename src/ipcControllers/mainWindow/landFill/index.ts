import fs from 'fs';
import path from 'path';
import {ipcMain} from 'electron';
import {appDataFolderPath} from '../../../utils';
import {landfillAPI, IAddedItem} from '../../../backend/landfill/API';

const scannedFolder = path.resolve(appDataFolderPath, './_scanned');
const scannedFilePath = path.resolve(scannedFolder, './scanned.json');

const getScannedList = () => {
  // check if the scanned folder exists
  if (!fs.existsSync(scannedFolder)) {
    // if it doesn't, create it
    fs.mkdirSync(scannedFolder, {recursive: true});
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
  ipcMain.handle(
    'landFill-add-item-to-users-default-list',
    async (_, item: string): Promise<IAddedItem> => {
      const data: IAddedItem = await landfillAPI.addItemToUsersDefaultList(item);
      return data;
    },
  );
  ipcMain.handle('landFill-get-scanned-list', () => {
    const scannedList = getScannedList();
    return scannedList;
  });
  ipcMain.handle('landFill-add-item-to-scanned-list', (_, item: IAddedItem['product']) => {
    const scannedList = getScannedList();
    scannedList.push(item);
    fs.writeFileSync(scannedFilePath, JSON.stringify(scannedList));
    return scannedList;
  });
  // TODO: Add a handler for editing an item in the scanned list
  ipcMain.handle('landFill-edit-item-in-scanned-list', async (_, item: IAddedItem['product']) => {
    // log the item to be edited for now
    const updatedItem = await landfillAPI.editItemInDefaultList(item._id, item.productAlias);
    if (updatedItem) {
      const scannedList = getScannedList();
      // eslint-disable-next-line
      // @ts-ignore
      const itemIndex = scannedList.findIndex(scannedItem => scannedItem._id === item._id);
      scannedList[itemIndex] = {...scannedList[itemIndex], productAlias: item.productAlias};
      fs.writeFileSync(scannedFilePath, JSON.stringify(scannedList));
      return updatedItem;
    }
    return null;
  });
};

export default handlers;
