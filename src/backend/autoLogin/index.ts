import fs from 'fs';
import { envFilePath } from '../utils/env';
import { IUserEncrypted, IUser } from '../db/models';
import { validators } from '../../frontend/utils/validators';
import { UserController } from '../db/controllers';
import landfillAPI from '../landfill/API';


export const autoLogin = {
    enable: (encryptionKey: Buffer, currentUser: IUserEncrypted) => {
        // covert the encryption key to a hex string
        const hexKey = encryptionKey.toString('hex');
        const _envFilePath = envFilePath();
        const envs = fs.readFileSync(_envFilePath, 'utf8').split('\n');

        const autoLoginKeyLine = envs.find(env => env.includes('AUTO_LOGIN_KEY='));
        // if it exists, replace it with the new key
        if (autoLoginKeyLine) {
            const newAutoLoginKeyLine = `AUTO_LOGIN_KEY=${hexKey}`;
            const newEnvs = envs.map(env => env === autoLoginKeyLine ? newAutoLoginKeyLine : env).filter(env => env.length);
            fs.writeFileSync(_envFilePath, newEnvs.join('\n') + '\n');
        } else {
            // if it doesn't exist, add it to the end of the file
            fs.appendFileSync(_envFilePath, `AUTO_LOGIN_KEY=${hexKey}\n`);
        }

        const autoLoginUserLine = envs.find(env => env.includes('AUTO_LOGIN_USER='));
        // if it exists, replace it with the new user
        if (autoLoginUserLine) {
            const newAutoLoginUserLine = `AUTO_LOGIN_USER=${currentUser.username}`;
            const newEnvs = envs.map(env => env === autoLoginUserLine ? newAutoLoginUserLine : env).filter(env => env.length);
            fs.writeFileSync(_envFilePath, newEnvs.join('\n') + '\n');
        } else {
            // if it doesn't exist, add it to the end of the file
            fs.appendFileSync(_envFilePath, `AUTO_LOGIN_USER=${currentUser.username}\n`);
        }

        // add to process.env
        process.env.AUTO_LOGIN_USER = currentUser.username;
        process.env.AUTO_LOGIN_KEY = hexKey;
    },
    disable: () => {
        const _envFilePath = envFilePath();
        const envs = fs.readFileSync(_envFilePath, 'utf8').split('\n');
        const newEnvs = envs
            .filter(env => !env.includes('AUTO_LOGIN_KEY=') && !env.includes('AUTO_LOGIN_USER='))
            .filter(env => env.length);

        fs.writeFileSync(_envFilePath, newEnvs.join('\n') + '\n');

        delete process.env.AUTO_LOGIN_KEY;
        delete process.env.AUTO_LOGIN_USER;
    },

    isEnabled: () => {
        const envs = fs.readFileSync(envFilePath(), 'utf8').split('\n');
        const autoLoginKeyLine = envs.find(env => env.includes('AUTO_LOGIN_KEY='));
        const autoLoginUserLine = envs.find(env => env.includes('AUTO_LOGIN_USER='));

        return autoLoginKeyLine && autoLoginUserLine;
    },

    getAutoLoginUser: () => {
        const envs = fs.readFileSync(envFilePath(), 'utf8').split('\n');
        const autoLoginUserLine = envs.find(env => env.includes('AUTO_LOGIN_USER='));

        if (autoLoginUserLine) {
            return autoLoginUserLine.replace('AUTO_LOGIN_USER=', '');
        }

        return null;
    },

    getAutoLoginKey: () => {
        const envs = fs.readFileSync(envFilePath(), 'utf8').split('\n');
        const autoLoginKeyLine = envs.find(env => env.includes('AUTO_LOGIN_KEY='));

        if (autoLoginKeyLine) {
            return Buffer.from(autoLoginKeyLine.replace('AUTO_LOGIN_KEY=', ''), 'hex');
        }

        return null;
    },

    get(): { username: string, encryptionKey: Buffer } | null {
        const user = this.getAutoLoginUser();
        const key = this.getAutoLoginKey();

        if (user && key) {
            return { username: user, encryptionKey: key };
        }

        return null;
    },


    autoLoginUser: async (
        sessionLogin: (user: IUser, encryptionPassword: string, encryptionKey?: Buffer) => Promise<void>,
        setEncryptionKey: (key: Buffer) => void
    ): Promise<boolean> => {
        const isAutoLoginEnabled = autoLogin.isEnabled();

        if (!isAutoLoginEnabled) return false;

        const { username, encryptionKey } = autoLogin.get();


        // get the user from the database
        const decryptedUser = await UserController.getUserBy.username(username, '', encryptionKey);

        if (!decryptedUser || decryptedUser === null) return false;

        const decryptedSuccessfully = decryptedUser.email.includes('@') && validators.isEmail(decryptedUser.email);

        if (!decryptedSuccessfully) return false;

        decryptedUser && (async () => {
            await sessionLogin(decryptedUser, '', encryptionKey).then(async () => {
                setEncryptionKey(encryptionKey);

                landfillAPI.logInToUPCServer();
            });
        })();

        return true;
    }
};

export default autoLogin;
