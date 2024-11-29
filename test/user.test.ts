/* eslint-disable no-undef */
import mongoose from 'mongoose';
import User from '../src/api/users/model.ts';
import { UsersRoleEnum } from '../src/utils/enum.ts';

describe('User Model Test', () => {
    it('should create & save user successfully', async () => {
        const userData = {
            username: 'testuser',
            email: 'testuser@example.com',
            password: 'password123',
            salt: 'randomsalt',
            firstName: 'Test',
            lastName: 'User',
            role: UsersRoleEnum.USER,
            isActive: true,
        };
        const validUser = new User(userData);
        const savedUser = await validUser.save();

        expect(savedUser._id).toBeDefined();
        expect(savedUser.username).toBe(userData.username);
        expect(savedUser.email).toBe(userData.email);
        expect(savedUser.firstName).toBe(userData.firstName);
        expect(savedUser.lastName).toBe(userData.lastName);
        expect(savedUser.role).toBe(userData.role);
        expect(savedUser.isActive).toBe(userData.isActive);
        expect(savedUser.password).not.toBe(userData.password); // Password should be hashed
    });

    it('should insert user successfully, but the field does not defined in schema should be undefined', async () => {
        const userWithInvalidField = new User({
            username: 'testuser2',
            email: 'testuser2@example.com',
            password: 'password123',
            salt: 'randomsalt',
            firstName: 'Test',
            lastName: 'User',
            role: UsersRoleEnum.USER,
            isActive: true,
            nickname: 'testnickname', // This field is not defined in schema
        });
        const savedUserWithInvalidField = await userWithInvalidField.save();
        expect(savedUserWithInvalidField._id).toBeDefined();
        expect(savedUserWithInvalidField.username).toBeDefined();
    });

    it('should not create user without required field', async () => {
        const userWithoutRequiredField = new User({ username: 'testuser3' });
        let err;
        try {
            await userWithoutRequiredField.save();
        } catch (error) {
            err = error;
        }
        expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
        expect(err.errors.email).toBeDefined();
        expect(err.errors.password).toBeDefined();
        expect(err.errors.firstName).toBeDefined();
        expect(err.errors.lastName).toBeDefined();
    });
});