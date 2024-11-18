import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { UsersRoleEnum } from '../../utils/enum.ts'
import config from '../../config.ts';
import { JwtPayload } from './jwt.ts';
import User, { IUser } from '../../api/users/model.ts';

import { Strategy as JWTstrategy, ExtractJwt } from 'passport-jwt';

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


passport.use(
    new JWTstrategy(
        {
            secretOrKey: secretKey,
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
        },
        async (token, done) => {
            try {
                return done(null, token.user);
            } catch (error) {
                done(error);
            }
        }
    )
);

export const authenticate = (hasMasterKey?: boolean, roles?: UsersRoleEnum[], ) => {
    return (req: Request, res: Response, next: NextFunction) => {
        passport.authenticate('jwt', { session: false }, (err: any, user: IUser | undefined) => {
            if (err) {
                return next(err);
            };

            const authHeader = req.headers['authorization'];
            
            const tokenMasterKey = typeof authHeader === 'string' ? authHeader.split(' ')[1] : undefined;

            if (hasMasterKey && tokenMasterKey === masterKey) {
                req.user = { role: UsersRoleEnum.ADMIN, email: "admin", username: "admin" } as IUser;
                return next();
            }

            if (user && roles?.length && !roles.includes(user.role)) {
                return res.status(403).send('Forbidden');
            }

            if (!user) {
                return res.status(401).send('Unauthorized');
            }

            req.user = user;
            next();
        })(req, res, next);
    };
};

export default passport;
