import path from 'path';
import dotenv from 'dotenv';
export const envPath = path.join(__dirname, '../../../.env');

dotenv.config({
    path: envPath
});
const rootFromPath = (path: string): string => {
    const root = path.split('/')[2];
    return root;
};

export const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 9000;
export const rootUser: string = process.env.ROOT_USER ?? rootFromPath(envPath);
export const documentFolder = path.resolve('/home', rootUser, 'Documents');
export const scannedFolder = path.resolve(documentFolder, 'scanned');
export const scannedJson = path.resolve(scannedFolder, 'scanned_data.json');
