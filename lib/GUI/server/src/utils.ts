import * as fs from 'fs';
import { IScannedData } from './types';
import { scannedFolder, scannedJson } from './constants';


export const rootFromPath = (path: string): string => {
    const root = path.split('/')[2];
    return root;
};

export const readScannedJson = (): IScannedData => {
    if (!fs.existsSync(scannedFolder)) {
        fs.mkdirSync(scannedFolder);
    }

    if (!fs.existsSync(scannedJson)) {

        fs.writeFileSync(scannedJson, JSON.stringify({ recentlyScanned: [] }));
    }

    return JSON.parse(fs.readFileSync(scannedJson, 'utf8'));
};

