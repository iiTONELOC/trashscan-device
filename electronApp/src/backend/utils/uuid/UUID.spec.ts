import { generateUUID } from './index';

describe('UUID utilities', () => {
    describe('generateUUID', () => {
        it('should be defined', () => {
            expect(generateUUID).toBeDefined();
        });

        it('should return a string', () => {
            expect(typeof generateUUID()).toBe('string');
        });

        it('should return a string of length 36', () => {
            expect(generateUUID().length).toBe(36);
        });

        it('should return a string in the format of a UUID', () => {
            const uuid = generateUUID();
            expect(uuid).toMatch(/^[a-f0-9]{8}-([a-f0-9]{4}-){3}[a-f0-9]{12}$/);
        });

        it('should return a different UUID when called again', () => {
            const uuid1 = generateUUID();
            const uuid2 = generateUUID();
            expect(uuid1).not.toBe(uuid2);
        });

        it('should be unique when called 1000 times', () => {
            const uuids: string[] = [];
            for (let i = 0; i < 1000; i++) {
                uuids.push(generateUUID());
            }
            expect(uuids.length).toBe(1000);

            // check that each uuid is unique
            uuids.forEach(uuid => {
                expect(typeof uuid).toBe('string');
                expect(uuid.length).toBe(36);
                expect(uuid).toMatch(/^[a-f0-9]{8}-([a-f0-9]{4}-){3}[a-f0-9]{12}$/);
                // check that the uuid is not in the array more than once
                expect(uuids.filter(u => u === uuid).length).toBe(1);
            });
        });
    });
});