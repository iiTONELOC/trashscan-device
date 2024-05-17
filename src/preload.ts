import {IAddedItem} from './backend/landfill/API';
import {contextBridge, ipcRenderer} from 'electron';
import {ICreateUserArgs, ILoginArgs, IMainWindowIpcBridge} from './ipcControllers';

/**
 * Handlers for the main process to invoke.

 * These are exposed to the renderer process via the context bridge and allows
 * us to call functions in the main process from the renderer process, which are
 * isolated from each other.
 *
 * @see https://www.electronjs.org/docs/latest/api/context-bridge
 */
const centralBridge: IMainWindowIpcBridge = {
  db: {
    readUsers: () => ipcRenderer.invoke('db-read-users'),
    createUser: (args: ICreateUserArgs) => ipcRenderer.invoke('db-create-user', args),
  },
  session: {
    getLoggedInUser: () => ipcRenderer.invoke('session-get-logged-in-user'),
    login: (args: ILoginArgs) => ipcRenderer.invoke('session-login', args),
    logout: () => ipcRenderer.invoke('session-logout'),
    enableAutoLogin: () => ipcRenderer.invoke('session-enable-auto-login'),
    disableAutoLogin: () => ipcRenderer.invoke('session-disable-auto-login'),
    autoLogin: () => ipcRenderer.invoke('session-auto-login'),
  },
  appSettings: {
    getSettings: () => ipcRenderer.invoke('appSettings-get-settings'),
    getSetting: (key: string) => ipcRenderer.invoke('appSettings-get-setting', key),
    getSettingDecrypted: (key: string, password: string) =>
      ipcRenderer.invoke('appSettings-get-setting-decrypted', key, password),
    addSetting: (key: string, value: string) =>
      ipcRenderer.invoke('appSettings-add-setting', key, value),
    updateSetting: (key: string, value: string) =>
      ipcRenderer.invoke('appSettings-update-setting', key, value),
  },
  landFill: {
    loginToUPCServer: () => ipcRenderer.invoke('landFill-login-to-upc-server'),
    addItemToUsersDefaultList: (item: string) =>
      ipcRenderer.invoke('landFill-add-item-to-users-default-list', item),
    addItemToScannedList: (item: IAddedItem['product']) =>
      ipcRenderer.invoke('landFill-add-item-to-scanned-list', item),
    getScannedList: () => ipcRenderer.invoke('landFill-get-scanned-list'),
    //TODO: Add a handler for editing an item in the scanned list
    editItemInScannedList: (item: IAddedItem['product']) =>
      ipcRenderer.invoke('landFill-edit-item-in-scanned-list', item),
  },
};

contextBridge.exposeInMainWorld('centralBridge', centralBridge);
