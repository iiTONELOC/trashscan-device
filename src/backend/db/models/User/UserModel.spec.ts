import User, { IUser } from '.';
import { describe, expect, it } from '@jest/globals';

describe('User Model', () => {
    const testUserData: IUser = {
        username: 'testUser',
        email: 'test@test.com',
        deviceID: '121546432sdfa543',
        password: 'password'
    };

    it('Should be defined', () => {
        expect(User).toBeDefined();
    });

    it('Should be a class', () => {
        expect(typeof User).toBe('function');
    });

    it('Should create a new User instance', () => {
        const user = new User(testUserData);
        expect(user).toBeDefined();
        expect(user).toBeInstanceOf(User);

        expect(user).toHaveProperty('email');
        expect(user).toHaveProperty('username');
        expect(user).toHaveProperty('deviceID');
        expect(user).toHaveProperty('password');

        expect(user.email).toBe(testUserData.email);
        expect(user.username).toBe(testUserData.username);
        expect(user.deviceID).toBe(testUserData.deviceID);
        expect(user.password).toBe(testUserData.password);

        expect(user.toJSON()).toEqual({
            username: user.username,
            deviceID: user.deviceID,
            email: user.email
        });
    });

    it('Should throw an error if no username is provided', () => {
        expect(() => {
            new User({ ...testUserData, username: '' });
        }).toThrowError('No username found');
    });

    it('Should throw an error if no deviceID is provided', () => {
        expect(() => {
            new User({ ...testUserData, deviceID: '' });
        }).toThrowError('No deviceID found');
    });

    it('Should throw an error if no password is provided', () => {
        expect(() => {
            new User({ ...testUserData, password: '' });
        }).toThrowError('No password found');
    });

    it('Should throw an error if no email is provided', () => {
        expect(() => {
            new User({ ...testUserData, email: '' });
        }).toThrowError('No email found');
    });

    // it('Should throw an error if the email is invalid', () => {
    //     expect(() => {
    //         new User({ ...testUserData, email: 'invalidEmail' });
    //     }).toThrowError('Invalid email');
    // });

});
