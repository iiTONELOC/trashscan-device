import fs from 'fs';
import * as dotenv from 'dotenv';
import { envFilePath } from '../backend/utils/env';

// create the envFilePath if it does not exist
const doesEnvFileExist = fs.existsSync(envFilePath());
if (!doesEnvFileExist) {
    fs.writeFileSync(envFilePath(), '');
}

dotenv.config({ path: envFilePath() });
