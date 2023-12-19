import { appDataFolderPath } from '../../utils';
import path from 'path';

const settingsDir = () => (path.join(appDataFolderPath, './_settings'));
const envFile = () => process.env.NODE_ENV === 'test' ? '.env.test' : '.env';

export const envFilePath = () => path.join(settingsDir(), envFile());
