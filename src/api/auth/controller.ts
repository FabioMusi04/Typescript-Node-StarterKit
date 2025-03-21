import { Request, Response, NextFunction, RequestHandler } from 'express';
import passport from 'passport';
import User, { IUser, SocialProvider } from '../users/model.ts'
import { UsersRoleEnum } from '../../utils/enum.ts';
import { generateToken } from '../../services/auth/jwt.ts';
import client, { account } from '../../services/appwrite/index.ts';
import { OAuthProvider, Query, Users } from 'node-appwrite';
import _ from 'lodash';
import Config from '../../config.ts';

const users = new Users(client);

export const register: RequestHandler = async (req: Request, res: Response) => {
    try {
        const { username, email, password, firstName, lastName } = req.body;

        if (_.isNil(username) || _.isNil(email) || _.isNil(password) || _.isNil(firstName) || _.isNil(lastName)) {
            throw new Error('Missing required fields');
        }

        const foundUser = await User
            .findOne({ $or: [{ username }, { email }] })

        if (foundUser) {
            throw new Error('User already exists, change username or email');
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
        res.status(500).json({ details: [{ message: error.message }] });
    }
};


export const login = (req: Request, res: Response, next: NextFunction): void => {
    passport.authenticate(
        'login',
        async (err: Error | null, user: IUser) => {
            try {
                if (err || !user) {
                    return res.status(401).json({ message: err?.message || 'User not found' });
                }

                req.login(
                    user,
                    { session: false },
                    async (error) => {
                        if (error) return next(error);
                        const token = generateToken(user);
                        return res.json({ token, user });
                    }
                );
            } catch (error) {
                return next(error);
            }
        }
    )(req, res, next);
};

export const authGoogle = async (req: Request, res: Response): Promise<void> => {
    try {
        if (account === null) {
            throw new Error('Appwrite account not initialized');
        }

        const baseUrl = `${req.protocol}://${req.get('host')}`;
        if (!baseUrl) {
            throw new Error('Base URL not found');
        }
        const redirectURL = await account.createOAuth2Token(OAuthProvider.Google,
            `${baseUrl}/auth/google/success`)
        res.send(redirectURL);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const authSuccess = async (req: Request, res: Response): Promise<void> => {
    try {
        if (account === null) {
            throw new Error('Appwrite account not initialized');
        }
        
        const { userId, secret } = req.query as { userId: string; secret: string };
        await account.createSession(userId, secret);
        const user = await users.get(userId);

        const identity = await users.listIdentities([Query.equal('userId', userId), Query.equal('provider', OAuthProvider.Google)]);
        if (!identity || identity.total === 0) {
            throw new Error('No Google identity found');
        }
        const { email, name } = user;
        const [firstName, ...lastNameParts] = name.split(' ');
        const lastName = lastNameParts.join(' ');
        const username = email.split('@')[0];

        const socialProvider = _.find(identity.identities, (identity) => {
            return identity.provider === OAuthProvider.Google;
        });
        if (!socialProvider) {
            throw new Error('No Google identity found');
        }

        const socialProviders: SocialProvider[] = [
            {
                providerName: OAuthProvider.Google,
                identityId: socialProvider.$id,
            },
        ];

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
                $elemMatch: {
                    providerName: OAuthProvider.Google,
                    identityId: socialProvider.$id,
                },
            },
        });

        if (!existingUser) {
            existingUser = new User(userData);
            await existingUser.save();

            if (!existingUser) {
                throw new Error('There was an error creating the user');
            }
        }

        const token = generateToken(existingUser);
        res.redirect(Config.clientUrl + '/auth?token=' + token + '&user=' + JSON.stringify(existingUser));

    } catch (error) {
        res.status(500).json({ ERROR: (error as Error).message });
    }
};