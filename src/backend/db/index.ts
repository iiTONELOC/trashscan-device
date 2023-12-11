import path from 'path';
import * as fs from 'fs';
import models from './models';

const dbFolder = '_db';

// Determines the correct database file name based on the environment
// istanbul ignore next
const dbFileName = () => {
    switch (process.env.NODE_ENV) {
        case 'development':
            return 'developDb.json';
        case 'test':
            return 'testDb.json';
        default:
            return 'secureDb.json';
    }
}

// retrieves the database file name
const _dbFileName = dbFileName();

// checks that the database directory exists, and creates one if it does not
const checkIfDbFolderExists = () => {
    if (!fs.existsSync(dbFolder)) {
        fs.mkdirSync(dbFolder);
    }
}
export interface IDB {
    dbName: string;
    createdAt: number;
    updatedAt?: number;
    models: {
        [key: string]: {
            [key: string]: unknown;
        };
    };
}

/**
 * Reads the database into memory and returns it as a parsed JSON object
 * @returns {IDB | null} - returns the database object or null if the file does not exist
 */
export async function readDB(): Promise<IDB | null> {
    try {
        // check if the folder exists
        checkIfDbFolderExists();
        const dbFileName = path.join(dbFolder, _dbFileName);
        const dbFileData = fs.readFileSync(dbFileName, 'utf8');
        return JSON.parse(dbFileData);
    } catch (error) {
        // istanbul ignore next
        return null;
    }
}

/**
 * Writes the database object to the database file
 * @param db - the database object to write to the database file
 */
export async function writeToDB(db: IDB) {
    checkIfDbFolderExists();
    const dbFileName = path.join(dbFolder, _dbFileName);

    fs.writeFileSync(dbFileName, JSON.stringify(db));
}

/**
 * Initializes the database. In development mode, this will delete the existing database file and create a new one.
 *
 * @returns {IDB} - returns the database object
 */
export async function init(): Promise<IDB | null> {
    // look for a database file
    let dbFile = await readDB();
    const dbFileName = path.join(dbFolder, _dbFileName);

    // delete the test db so tests will run on a fresh db and pass
    if (_dbFileName === 'testDb.json' && fs.existsSync(dbFolder) && fs.existsSync(dbFileName)) {
        try {
            fs.unlinkSync(path.join(dbFolder, _dbFileName));
            dbFile = null;
        } catch (error) {
            // istanbul ignore next
            console.log(error);
        }
    }

    // if we do not have a database file, create one
    if (dbFile === null) {
        const initialData: IDB = { 'dbName': _dbFileName, 'createdAt': Date.now(), 'models': Object.create({}) };

        for (const [key] of [...Object.entries(models)]) {
            initialData.models[key] = {};
        }
        fs.writeFileSync(path.join(dbFolder, _dbFileName), JSON.stringify(initialData));

        dbFile = await readDB();
    }

    return dbFile;
}


export default {
    init,
    readDB,
    writeToDB
};
