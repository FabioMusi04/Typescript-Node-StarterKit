import { Request, Response, NextFunction, RequestHandler } from 'express';
import passport from 'passport';
import User, { IUser } from '../users/model.ts'
import { UsersRoleEnum } from '../../utils/enum.ts';
import { generateToken } from '../../services/auth/jwt.ts';

export const register: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { username, email, password, firstName, lastName } = req.body;

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
    passport.authenticate(
        'login',
        async (err: Error | null, user: IUser) => {
            try {
                if (err || !user) {
                    const error = new Error('An error occurred.');

                    return next(error);
                }

                req.login(
                    user,
                    { session: false },
                    async (error) => {
                        if (error) return next(error);

                        const token = generateToken(user);

                        return res.json({ token });
                    }
                );
            } catch (error) {
                return next(error);
            }
        }
    )(req, res, next);
};