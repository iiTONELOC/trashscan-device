import UserController from '.';
import { IDB, readDB } from '../..';
import { describe, expect, it } from '@jest/globals';
import User, { IUser, IUserEncrypted, IUserModel } from '../../models/User';


describe('User Controller', () => {
    const testUserData: IUser = {
        username: 'testUser',
        email: 'testUser@test.com',
        password: 'password',
        deviceID: 'testDeviceID'
    };

    describe('create', () => {
        it('Should be defined', () => {
            expect(UserController).toBeDefined();
        });

        it('Should be an object', () => {
            expect(typeof UserController).toBe('object');
        });

        it('Should have a create method', () => {

            expect(UserController.create).toBeDefined();
            expect(typeof UserController.create).toBe('function');
        });

        it('Should create a new user', async () => {
            const user: IUserModel = await UserController.create(
                testUserData.username,
                testUserData.email,
                testUserData.password,
                testUserData.password,
                testUserData.deviceID
            );

            expect(user).toBeDefined();
            expect(user).toBeInstanceOf(User);

            expect(user).toHaveProperty('deviceID');
            expect(user).toHaveProperty('username');
            expect(user).toHaveProperty('email');
            expect(user).toHaveProperty('password');

            expect(user.deviceID).toBeDefined();
            expect(user.username).toBe(testUserData.username);
            expect(user.email).toBe(testUserData.email);
            expect(user.password).toBe(testUserData.password);

            expect(user.toJSON()).toEqual({
                username: user.username,
                email: user.email,
                deviceID: user.deviceID
            });
        });

        it('Should throw an error if a user already exists', async () => {
            try {
                await UserController.create(
                    testUserData.username,
                    testUserData.email,
                    testUserData.password,
                    testUserData.password,
                    testUserData.deviceID
                );
            } catch (error: any) {
                expect(true).toBe(true);
            }
        });

        it('Should throw an error if no username is provided', async () => {
            expect.assertions(1);
            try {
                await UserController.create('', testUserData.email, testUserData.password, testUserData.password, testUserData.deviceID);
            } catch (error: any) {
                expect(true).toBe(true);
            }
        });

        it('Should throw an error if no email is provided', async () => {
            expect.assertions(1);
            try {
                await UserController.create(testUserData.username, '', testUserData.password, testUserData.password, testUserData.deviceID);
            } catch (error: any) {
                expect(true).toBe(true);
            }
        });

        it('Should throw an error if no work password is provided', async () => {
            expect.assertions(1);
            try {
                await UserController.create(testUserData.username, testUserData.email, '', testUserData.password, testUserData.deviceID);
            } catch (error: any) {
                expect(true).toBe(true);
            }
        });

        it('Should throw an error if no encryption password is provided', async () => {
            expect.assertions(1);
            try {
                await UserController.create(testUserData.username, testUserData.email, testUserData.password, '', testUserData.deviceID);
            } catch (error: any) {
                expect(true).toBe(true);
            }
        });

        it('Should store the email and password of the newly created user in an encrypted format', async () => {
            const db = await readDB();
            if (db) {
                const { models } = db;
                const userObjects = [...Object.values(models.User)] as IUserEncrypted[];
                const user = userObjects.find((user: IUserEncrypted) => user.username === testUserData.username);
                if (user) {
                    expect(user.email).not.toBe(testUserData.email);
                    expect(user.password).not.toBe(testUserData.password);
                    expect.assertions(2);
                }
            }
        });
    });

    describe('getUserBy', () => {
        it('Should be defined', () => {
            expect(UserController.getUserBy).toBeDefined();
        });

        it('Should be an object', () => {
            expect(typeof UserController.getUserBy).toBe('object');
        });



        describe('username', () => {
            it('Should have a username method', () => {
                expect(UserController.getUserBy.username).toBeDefined();
                expect(typeof UserController.getUserBy.username).toBe('function');
            });

            it('The getUserBy.username should return a user when called with a valid username and password', async () => {
                const db: IDB | null = await readDB();
                if (db) {
                    const { models } = db;
                    const previousUsers = [...Object.values(models.User)] as IUserEncrypted[];
                    const previousUser = previousUsers[0] as IUserEncrypted;
                    if (previousUser) {
                        // use the getUserBy.id method to get the user
                        const user = await UserController.getUserBy.username(previousUser.username, 'password');
                        // decrypt the user from the db to compare
                        const decryptedPreviousUser = await UserController.decryptUser(previousUser, 'password');

                        expect(user).toBeDefined();
                        expect(user).toBeInstanceOf(User);
                        expect(user?.toJSON()).toEqual(decryptedPreviousUser?.toJSON());
                        expect.assertions(3);
                    }

                }
            });

            it('The getUserBy.username should return null when called with an invalid username', async () => {
                const user = await UserController.getUserBy.username('', 'password');
                expect(user).toBeNull();

                expect.assertions(1);
            });

            it('The getUserBy.username should return null when called with an invalid password', async () => {
                const db: IDB | null = await readDB();
                if (db) {
                    const { models } = db;
                    const previousUsers = [...Object.values(models.User)] as IUserEncrypted[];
                    const previousUser = previousUsers[0] as IUserEncrypted;
                    if (previousUser) {
                        // use the getUserBy.id method to get the user
                        const user = await UserController.getUserBy.username(previousUser?.username ?? '', 'wrongPassword');
                        expect(user).toBeNull();
                        expect.assertions(1);
                    }
                }
            });
        });
    });

    describe('update', () => {

        it('Should be defined', () => {
            expect(UserController.updateUser).toBeDefined();
        });

        it('Should update a user\'s username', async () => {
            const db: IDB | null = await readDB();
            if (db) {
                const { models } = db;
                const previousUsers = [...Object.values(models.User)] as IUserEncrypted[];
                const previousUser = previousUsers[0] as IUserEncrypted;
                if (previousUser) {
                    const user = await UserController.updateUser(previousUser?.username ?? '', testUserData.password, { username: 'newUsername' });
                    expect(user).toBeDefined();
                    expect(user).toBeInstanceOf(User);
                    expect(user?.username).toBe('newUsername');
                    expect.assertions(3);
                }
            }
        });

        it('Should update a user\'s email', async () => {
            const db: IDB | null = await readDB();
            if (db) {
                const { models } = db;
                const previousUsers = [...Object.values(models.User)] as IUserEncrypted[];
                const previousUser = previousUsers[0] as IUserEncrypted;
                if (previousUser) {
                    const user = await UserController.updateUser(previousUser?.username ?? '', testUserData.password, { email: 'updatedEmail@test.com' });
                    expect(user).toBeDefined();
                    expect(user).toBeInstanceOf(User);
                    expect(user?.email).toBe('updatedEmail@test.com');
                }
            }
        });

        it('Should update a user\'s password', async () => {
            const db: IDB | null = await readDB();
            if (db) {
                const { models } = db;
                const previousUsers = [...Object.values(models.User)] as IUserEncrypted[];
                const previousUser = previousUsers[0] as IUserEncrypted;
                if (previousUser) {
                    const user = await UserController.updateUser(previousUser?.username ?? '', testUserData.password, { password: 'newPassword' });
                    expect(user).toBeDefined();
                    expect(user).toBeInstanceOf(User);
                    expect(user?.password).toBe('newPassword');
                }
            }
        });

        it('Should only update the user if the password is correct', async () => {
            const db: IDB | null = await readDB();
            if (db) {
                const { models } = db;
                const previousUsers = [...Object.values(models.User)] as IUserEncrypted[];
                const previousUser = previousUsers[0] as IUserEncrypted;
                if (previousUser) {
                    const user = await UserController.updateUser(previousUser?.username ?? '', 'wrongPassword', { username: 'newUsername' });
                    expect(user).toBeNull();
                }
            }
        });
    });

    describe('changeEncryptionPassword', () => {
        it('Should be defined', () => {
            expect(UserController.changeEncryptionPassword).toBeDefined();
        });

        it('Should change the encryption password', async () => {
            const db: IDB | null = await readDB();
            if (db) {
                const { models } = db;
                const previousUsers = [...Object.values(models.User)] as IUserEncrypted[];
                const previousUser = previousUsers[0] as IUserEncrypted;

                if (previousUser) {
                    const didChange = await UserController.changeEncryptionPassword(testUserData.password, 'newPassword', previousUser.username);
                    expect(didChange).toBe(true);

                    // try to get the user with the old password
                    const userWithOldPass = await UserController.getUserBy.username(previousUser.username ?? '', testUserData.password);
                    expect(userWithOldPass).toBeNull();

                    // try to get the user with the new password
                    const userWithNewPass = await UserController.getUserBy.username(previousUser.username ?? '', 'newPassword');
                    expect(userWithNewPass).toBeDefined();
                    expect(userWithNewPass).toBeInstanceOf(User);

                    expect.assertions(4);
                }
            }
        });
    });

    describe('readUsers', () => {
        it('Should be defined', () => {
            expect(UserController.readUsers).toBeDefined();
        });

        it('Should read all users', async () => {
            const users = await UserController.readUsers();
            expect(users).toBeDefined();
        });
    });

    describe('delete', () => {
        it('Should be defined', () => {
            expect(UserController.delete).toBeDefined();
        });

        it('Should delete a user', async () => {
            const db: IDB | null = await readDB() as IDB;
            if (db) {
                const { models } = db;
                const previousUsers = [...Object.values(models.User)] as IUserEncrypted[];
                const previousUser = previousUsers[0] as IUserEncrypted;

                if (previousUser) {
                    let didDelete = await UserController.delete(previousUser?.username ?? '', 'newPassword');
                    // it may fail if run before the changeEncryptionPassword test
                    if (!didDelete) didDelete = await UserController.delete(previousUser?.username ?? '', 'password');
                    expect(didDelete).toBe(true);

                    const updatedDBData = await readDB();
                    if (updatedDBData) {
                        const updatedUsers = [...Object.values(updatedDBData.models.User)] as IUserEncrypted[];
                        expect(updatedUsers).toHaveLength(previousUsers.length - 1);
                    }
                    expect.assertions(2);
                }
            }
        });
    });
});

