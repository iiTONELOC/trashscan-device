import db, { IDB } from '.';
import { describe, expect, it } from '@jest/globals';

describe('db', () => {

    describe('readDB', () => {
        it('should be defined', () => {
            expect(db.readDB).toBeDefined();
        });

        it('should return the database file if the database file exists', async () => {
            const created = await db.readDB();
            // check all props except for createdAt and updatedAt

            expect(created).toEqual(created);
        });

        describe('writeToDB', () => {
            it('should be defined', () => {
                expect(db.writeToDB).toBeDefined();
            });

            it('should write to the database file', async () => {
                const _db = await db.readDB();
                const newDbFile = { ..._db as IDB, updatedAt: Date.now() };
                await db.writeToDB(newDbFile);

                expect(await db.readDB()).toEqual(newDbFile);
            });
        });

    });
});
