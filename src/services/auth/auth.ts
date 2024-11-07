// authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { UsersRoleEnum } from '../../utils/enum.ts'
import config from '../../config.ts';
import { JwtPayload } from './jwt.ts';

const secretKey = config.jwtSecret;
const masterKey = config.masterKey;

passport.use(
    new JwtStrategy(
        {
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: secretKey,
        },
        (jwtPayload: JwtPayload, done) => {
            try {
                return done(null, jwtPayload);
            } catch (error) {
                return done(error, false);
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
