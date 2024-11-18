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
    if (this.isModified('email')) {
        const user = await User.findOne({ email: this.email });
        if (user) {
            this.invalidate('email', 'email must be unique');
        }
    }

    next();
}