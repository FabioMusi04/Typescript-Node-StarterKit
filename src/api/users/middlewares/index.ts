import bcrypt from 'bcrypt';
import User, { IUser } from '../model.ts';

export async function hashPassword(this: IUser, next: () => void) {
    if (this.isModified('password')) {
        this.salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, this.salt);
    }
    next();
}

export async function checkFieldsAlreadyExist(this: IUser, next: () => void) {
    if (this.isModified('email') || this.isModified('username')) {
        const user = await User.findOne({ $or: [{ email: this.email }, { username: this.username }] });
        if (user) {
            if (user.email === this.email) this.invalidate('email', 'email must be unique');
            if (user.username === this.username) this.invalidate('username', 'username must be unique');
        }
    }

    next();
}