import jwt from 'jsonwebtoken';
import config from '../../config.ts'
import { UsersRoleEnum } from '../../utils/enum.ts';
import { IUser } from '../../api/users/model.ts'
import { generalLogger } from '../logger/winston.ts';

const secretKey = config.jwtSecret

export interface JwtPayload {
    _id: string;
    email: string;
    role: UsersRoleEnum;
}

export const generateToken = (user: IUser): string => {
    const { _id, email, role } = user as { _id: string; email: string; role: UsersRoleEnum }
    const payload: JwtPayload = { _id, email, role };
    return jwt.sign(payload, secretKey, { expiresIn: '3d' });
};

export const verifyToken = (token: string): JwtPayload | null => {
    try {
        return jwt.verify(token, secretKey) as JwtPayload;
    } catch (error) {
        generalLogger.error('JWT: ', { message: error.message });
        return null;
    }
};