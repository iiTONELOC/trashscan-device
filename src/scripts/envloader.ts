import fs from 'fs';
import * as dotenv from 'dotenv';
import { envFilePath } from '../backend/utils/env';

const filePath = envFilePath();
// create the envFilePath if it does not exist
const doesEnvFileExist = fs.existsSync(filePath);
if (!doesEnvFileExist) {
    const dirs = filePath.split('/');
    dirs.pop();

    console.log('ENV', process.env.NODE_ENV)

    const dirPath = dirs.join('/')

    fs.mkdirSync(dirPath)
    fs.writeFileSync(filePath, '');
}

dotenv.config({ path: filePath });
