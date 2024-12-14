import bcrypt from 'bcrypt';
import _ from 'lodash';
import { IUser } from '../model.ts';


// eslint-disable-next-line no-unused-vars
export const toJSON = function(this: IUser) {
    const user = this.toObject();
    return _.omit(user, ['password', 'salt', '__v']);
};

export const isValidPassword = async function(this: IUser, password: string) {
    const correct = await bcrypt.compare(password, this.password);
    return correct;
};