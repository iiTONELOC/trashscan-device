import { IMainWindowIpcBridge } from './ipcControllers';

declare global {
    interface Window {
        centralBridge: IMainWindowIpcBridge
    }
}
