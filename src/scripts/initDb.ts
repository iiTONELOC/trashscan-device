import { init } from '../backend/db';
/**
 * Creates the database for the environment
 * 
 * If we are in production mode, this will create the database file if it does not exist,
 * otherwise it will delete the existing database file and create a new one.
 */

console.log('Initializing database...');

(async () => {
    await init()
})()

