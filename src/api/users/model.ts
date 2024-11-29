import mongoose, { Document, Model, Schema } from 'mongoose';
import crypto from 'crypto';
import { UsersRoleEnum } from '../../utils/enum.ts';
import { checkFieldsAlreadyExist, hashPassword } from './middlewares/index.ts';
import mongooseToSwagger from 'mongoose-to-swagger';
import softDeletePlugin from '../../utils/lib/softDelete/index.ts';
import _ from 'lodash';
import bcrypt from 'bcrypt';

export interface SocialProvider {
  providerName: string;
  identityId: string;
}
export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  salt: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  role: UsersRoleEnum;
  socialProviders?: SocialProvider[];
  identityId?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface IUserMethods {
  toJSON(): Record<string, unknown>;
  // eslint-disable-next-line no-unused-vars
  isValidPassword(password: string): Promise<boolean>;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type UserModel = Model<IUser, {}, IUserMethods>;

const userSchema = new Schema<IUser, UserModel, IUserMethods>({
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
    required: function() {
      return _.isEmpty(this.socialProviders) || _.isNil(this.socialProviders);
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
    // eslint-disable-next-line no-unused-vars
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
    default: false,
  },
  socialProviders: {
    type: [
      {
        providerName: String,
        identityId: String,
      }
    ],
    default: undefined,
  }
}, {
  timestamps: true,
});


userSchema.pre<IUser>('save', checkFieldsAlreadyExist);
userSchema.pre<IUser>('save', hashPassword);

userSchema.plugin(softDeletePlugin);

userSchema.methods.toJSON = function() {
  const user = this.toObject();
  return _.omit(user, ['password', 'salt', '__v', 'socialProviders']);
};

userSchema.methods.isValidPassword = async function(password: string) {
  return bcrypt.compare(password, this.password);
};

const User = mongoose.model<IUser, UserModel>('User', userSchema);
export const swaggerSchema = mongooseToSwagger(User);


export default User;