import { Request, Response, NextFunction, RequestHandler } from 'express';
import passport from 'passport';
import User, { IUser } from '../users/model.ts'
import { UsersRoleEnum } from '../../utils/enum.ts';
import { generateToken } from '../../services/auth/jwt.ts';

export const register: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { username, email, password, firstName, confirmPassword, lastName } = req.body;

        if (password !== confirmPassword) {
            res.status(400).json({ message: 'Passwords do not match' });
            return;
        }

        const role: UsersRoleEnum = UsersRoleEnum.USER;
        const user = new User({
            username,
            email,
            password,
            firstName,
            lastName,
            role,
            isActive: true,
        });

        await user.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        next(error);
    }
};


export const login = (req: Request, res: Response, next: NextFunction): void => {
    passport.authenticate('local', (err: any, user: IUser, info: any) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        const token = generateToken(user);
        return res.status(200).json({ message: 'Logged in successfully', token });     
    })(req, res, next);
};