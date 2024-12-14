import bcrypt from 'bcrypt';
import User, { IUser } from '../model.ts';
import { z } from 'zod';

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
export const UpdateMeSchema = z.object({
    username: z.string().trim().min(3, { message: "must be at least 3 characters long" }).optional(),
    firstName: z.string().trim().min(2, { message: "must be at least 2 characters long" }).optional(),
    lastName: z.string().trim().min(2, { message: "must be at least 2 characters long" }).optional(),
});

export const UpdateMePasswordSchema = z.object({ 
    newPassword: z.string().trim().min(6, { message: "must be at least 6 characters long" }).max(20, { message: "must be at most 20 characters long" }),
});

export const UpdateMeProfilePictureSchema = z.object({
    profilePicture: z.string()
});