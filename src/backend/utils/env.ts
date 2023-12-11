import path from 'path';

const settingsDir = () => (path.resolve(process.cwd(), './_settings'));
const envFile = () => process.env.NODE_ENV === 'test' ? '.env.test' : '.env';

export const envFilePath = () => path.join(settingsDir(), envFile());
