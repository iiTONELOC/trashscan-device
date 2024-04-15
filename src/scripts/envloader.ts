import fs from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';
import {envFilePath} from '../backend/utils/env';

const filePath = envFilePath();

// create the envFilePath if it does not exist
const doesEnvFileExist = fs.existsSync(filePath);
if (!doesEnvFileExist) {
  // find the parent directory of the envFilePath
  const dirs = filePath.split(path.sep);
  // remove the file
  dirs.pop();

  // join the directories back together
  const dirPath = dirs.join(path.sep);

  // check if the directory exists
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, {recursive: true});
  }

  fs.writeFileSync(filePath, '');
}

dotenv.config({path: filePath});
