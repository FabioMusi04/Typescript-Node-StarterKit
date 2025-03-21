import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';
import dotenv from 'dotenv-safe';
import _ from 'lodash';
import { generalLogger } from './services/logger/winston.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

global._ = _;
global.__dirname = __dirname;

const requireProcessEnv = (name: string): string => {
    if (!process.env[name]) {
        if (process.env.NODE_ENV !== 'docs') {
            throw new Error('You must set the ' + name + ' environment variable');
        } else {
            generalLogger.warn('ENV: ', { message: 'You must set the ' + name + ' environment variable' });
        }
    }
    return process.env[name] as string;
};

if (process.env.NODE_ENV !== 'production') {
    dotenv.config({
        allowEmptyValues: true,
        path: path.join(__dirname, '../.env'),
        example: path.join(__dirname, '../.env.example')
    });
}

const APP_NAME = requireProcessEnv('APP_NAME');

interface MongoConfig {
    uri: string;
    options: {
        strictQuery: boolean;
        strictPopulate: boolean;
        debug?: boolean;
    };
}

interface AppWriteConfig {
    enabled: boolean;
    projectId: string;
    apiKey: string;
    endpoint: string;
    bucketProfileId: string;
    bucketUploadsId: string;
}

interface Config {
    appName: string;
    env: string;
    root: string;
    port: number;
    hostname: string;
    ip: string;
    masterKey: string;
    jwtSecret: string;
    mongo: MongoConfig;
    clientUrl: string;
    expressSSLRedirect?: boolean;
    appwrite: AppWriteConfig;
}

// eslint-disable-next-line no-unused-vars
const config: { [key in 'all' | 'test' | 'development' | 'production']: Partial<Config> } = {
    all: {
        appName: _.capitalize(APP_NAME),
        env: process.env.NODE_ENV || 'development',
        root: path.join(__dirname, '..'),
        port: _.toNumber(process.env.PORT) || 9000,
        hostname: os.hostname() || '',
        ip: process.env.IP || '0.0.0.0',
        masterKey: requireProcessEnv('MASTER_KEY'),
        jwtSecret: requireProcessEnv('JWT_SECRET'),
        mongo: {
            options: {
                strictQuery: false,
                strictPopulate: false,
            },
            uri: process.env.MONGODB_URI || `mongodb://localhost:27888/${APP_NAME}-dev`
        },
        clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
        appwrite: {
            enabled: requireProcessEnv('APPWRITE_ENABLED') === 'true' || false,
            projectId: requireProcessEnv('APPWRITE_PROJECT_ID'),
            apiKey: requireProcessEnv('APPWRITE_API_KEY'),
            endpoint: requireProcessEnv('APPWRITE_ENDPOINT'),
            bucketProfileId: requireProcessEnv('APPWRITE_BUCKET_PROFILEPICTURE_ID'),
            bucketUploadsId: requireProcessEnv('APPWRITE_BUCKET_UPLOADS_ID')
        }
    },
    test: {
        mongo: {
            uri: `mongodb://localhost:27888/${APP_NAME}-test`,
            options: {
                strictQuery: false,
                strictPopulate: false,
                debug: false,
            }
        }
    },
    development: {
        mongo: {
            uri: process.env.MONGODB_URI || `mongodb://localhost:27888/${APP_NAME}-dev`,
            options: {
                strictQuery: false,
                strictPopulate: false,
                debug: false,
            }
        }
    },
    production: {
        ip: process.env.IP,
        port: _.toNumber(process.env.PORT) || 8080,
        expressSSLRedirect: process.env.DISABLE_SSL_REDIRECT !== 'true',
        mongo: {
            uri: process.env.MONGODB_URI || `mongodb://localhost:27888/${APP_NAME}`,
            options: {
                strictQuery: false,
                strictPopulate: false,
                debug: false,
            }
        }
    }
};

const mergedConfig: Config = _.merge({}, config.all, config[config.all.env as 'test' | 'development' | 'production']) as Config;

export default mergedConfig;