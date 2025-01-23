import { ConfigurableSchema } from '../../utils/lib/mongoose/index.ts';
import { UsersRoleEnum } from '../../utils/enum.ts';
import mongoose, { Document, Model } from 'mongoose';
import { checkFieldsAlreadyExist, hashPassword } from './middlewares/index.ts';
import { isValidPassword, toJSON } from './utils/index.ts';

import crypto from 'crypto';
import mongooseToSwagger from 'mongoose-to-swagger';
import softDeletePlugin from '../../utils/lib/softDelete/index.ts';
import _ from 'lodash';

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

const userSchema = new ConfigurableSchema<IUser, UserModel, IUserMethods>({
  username: {
    type: String,
    required: true,
    q: true,
  },
  email: {
    type: String,
    required: true,
    immutable: true,
    q: true,
  },
  password: {
    type: String,
    required: function () {
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
    default: function (this: IUser) {
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
  configuration: {
    pre: {
      save: [checkFieldsAlreadyExist, hashPassword],
    },
    methods: {
      toJSON,
      isValidPassword,
    },
    plugins: [softDeletePlugin],
    indexes: [
      {
        fields: { email: 1 },
        options: { unique: true },
      },
      {
        fields: { username: 1 },
        options: { unique: true },
      },
    ],
  },
});

const User = mongoose.model<IUser, UserModel>('User', userSchema);
export const swaggerSchema = mongooseToSwagger(User);

export default User;