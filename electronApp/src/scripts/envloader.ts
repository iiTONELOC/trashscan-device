import * as dotenv from 'dotenv';
import * as path from 'path';


const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
const envFilePath = path.join(process.cwd(), envFile);

dotenv.config({ path: envFilePath });
