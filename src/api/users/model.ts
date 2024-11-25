import mongoose, { Document, Schema } from 'mongoose';
import crypto from 'crypto';
import { UsersRoleEnum } from '../../utils/enum.ts';
import { checkFieldsAlreadyExist, hashPassword } from './middlewares/index.ts';
import mongooseToSwagger from 'mongoose-to-swagger';
import softDeletePlugin from '../../utils/lib/softDelete/index.ts';
export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  salt: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  role: UsersRoleEnum;
  socialProvider?: string;
  identityId?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const userSchema = new Schema<IUser>({
  username: {
    type: String,
    required: true,
    unique: true,
    q: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    immutable: true,
    q: true,
  },
  password: {
    type: String,
    required: function(this: IUser) {
      return !this.socialProvider; // Password is required only if no social provider
    },
  },
  salt: {
    type: String,
  },
  firstName: {
    type: String,
    required: true,
    q: true,
  },
  lastName: {
    type: String,
    required: true,
    q: true,
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
    q: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  socialProvider: {
    type: String, // e.g., "google", "facebook"
    required: false,
  },
  identityId: {
    type: String, // The unique ID from the social provider
    required: false,
  },
}, {
  timestamps: true,
});


userSchema.pre<IUser>('save', checkFieldsAlreadyExist);
userSchema.pre<IUser>('save', hashPassword);

userSchema.plugin(softDeletePlugin);

userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.salt;
  return user;
};

const User = mongoose.model<IUser>('User', userSchema);
export const swaggerSchema = mongooseToSwagger(User);


export default User;