import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { UsersRoleEnum } from '../../utils/enum.ts';
import { checkFieldsAlreadyExist, hashPassword } from './middlewares/index.ts';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  salt: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  role: UsersRoleEnum;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  toJSON(): Omit<IUser, 'password' | 'salt'>;
}

const userSchema = new Schema<IUser>({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    immutable: true,
  },
  password: {
    type: String,
    required: true,
  },
  salt: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  profilePicture: {
    type: String,
    default: function(this: IUser) {
      const hash = crypto.createHash('md5').update(this.username || this.email).digest('hex');
      return `https://identicons.github.com/${hash}.png`;
    }
  },
  role: {
    type: String,
    enum: UsersRoleEnum,
    default: UsersRoleEnum.USER,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

userSchema.pre<IUser>('save', checkFieldsAlreadyExist);
userSchema.pre<IUser>('save', hashPassword);

/* userSchema.post<IUser>('save', function(doc, next) {
  console.log('A user has been saved:', doc);
  next();
}); */

userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.salt;
  return user;
};

const User = mongoose.model<IUser>('User', userSchema);

export default User;