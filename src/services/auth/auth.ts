import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { UsersRoleEnum } from '../../utils/enum.ts'
import config from '../../config.ts';
import { JwtPayload } from './jwt.ts';
import User, { IUser } from '../../api/users/model.ts';

const secretKey = config.jwtSecret;
const masterKey = config.masterKey;


passport.use(
    'login',
    new LocalStrategy(
        {
            usernameField: 'email',
            passwordField: 'password'
        },
        async (email, password, done) => {
            try {
                const user = await User.findOne({ email });

                if (!user) {
                    return done(null, false, { message: 'User not found' });
                }

                const validate = true // await user.isValidPassword(password);

                if (!validate) {
                    return done(null, false, { message: 'Wrong Password' });
                }

                return done(null, user, { message: 'Logged in Successfully' });
            } catch (error) {
                return done(error);
            }
        }
    )
);


export const token = (requiredRole?: UsersRoleEnum, useMasterKey: boolean = false) => {
    return (req: Request, res: Response, next: NextFunction) => {
        interface AuthenticatedRequest extends Request {
            user?: JwtPayload;
        }

        const token = req.headers.authorization?.split(' ')[1];

        if (useMasterKey && token === masterKey) {
            return next();
        }

        passport.authenticate('jwt', { session: false }, (err: any, user: JwtPayload, info: any) => {
            if (err || !user) {
                return res.status(401).json({ message: 'Unauthorized: Invalid or missing token' });
            }

            if (requiredRole && user.role !== requiredRole) {
                return res.status(403).json({ message: 'Forbidden: Insufficient role' });
            }

            (req as AuthenticatedRequest).user = user;
            next();
        })(req, res, next);
    };
};

export default passport;
