import { Request, Response, NextFunction, RequestHandler } from 'express';
import passport from 'passport';
import User, { IUser, SocialProvider } from '../users/model.ts'
import { UsersRoleEnum } from '../../utils/enum.ts';
import { generateToken } from '../../services/auth/jwt.ts';
import client, { account } from '../../services/appwrite/index.ts';
import { OAuthProvider, Query, Users } from 'node-appwrite';
import _ from 'lodash';

const users = new Users(client);

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
        async (err: any, user: IUser, info: any) => {
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

export const authGoogle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const redirectURL = await account.createOAuth2Token(OAuthProvider.Google,
            `http://localhost:3000/auth/google/success`)
        const htmlContent = `<button><a href="${redirectURL}">Sign in with Google</a></button>`;
        res.set("Content-Type", "text/html");
        res.send(htmlContent);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const authSuccess = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { userId, secret } = req.query as { userId: string; secret: string };
        const session = await account.createSession(userId, secret);

        const user = await users.get(userId);

        const identity = await users.listIdentities([Query.equal('userId', userId), Query.equal('provider', OAuthProvider.Google)]);
        if (!identity || identity.total === 0) {
            throw new Error('No Google identity found');
        }
        const { email, name } = user;
        const [firstName, ...lastNameParts] = name.split(' ');
        const lastName = lastNameParts.join(' ');
        const username = email.split('@')[0];

        const socialProviders = _.map(identity.identities, (identity) => {
            return {
                providerName: identity.provider,
                identityId: identity.$id,
            } as SocialProvider;
        });

        const userData: Partial<IUser> = {
            username,
            email,
            socialProviders,
            firstName: firstName || '',
            lastName: lastName || '',
            role: UsersRoleEnum.USER,
        };
        
        let existingUser = await User.findOne({
            email,
            socialProviders: {
                $all: socialProviders,
            },
        });

        if (!existingUser) {
            await User.updateOne({
                email,
            }, userData,
            {
                upsert: true,
            });

            existingUser = await User.findOne({
                email,
                socialProviders: {
                    $all: socialProviders,
                },
            });

            if (!existingUser) {
                throw new Error('There was an error creating the user');
            }
        }

        const token = generateToken(existingUser);
        res.status(200).json({ token });
        
    } catch (error) {
        res.json({ ERROR: (error as Error).message });
    }
};