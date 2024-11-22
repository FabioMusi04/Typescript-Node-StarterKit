import mongoose from 'mongoose';
import config from '../../config.ts';
import { generalLogger } from '../logger/winston.ts';

const mongoUri = config.mongo.uri;
const maxRetries = 5;
let retries = 0;

if (!mongoUri) {
    generalLogger.error('MONGODB: ', { message: 'MongoDB URI is missing' });
    process.exit(1);
}

const connectToDatabase = async () => {
    try {
        await mongoose.connect(mongoUri);
        generalLogger.info('MONGODB: ', { message: 'Connected to MongoDB' });
    } catch (error) {
        generalLogger.error('MONGODB: ', { message: `Failed to connect to MongoDB: ${error.message}` });

        if (retries < maxRetries) {
            retries += 1;
            generalLogger.info('MONGODB: ', { message: `Retrying connection in 5 seconds. Attempt ${retries}/${maxRetries}` });
            setTimeout(connectToDatabase, 5000);
        } else {
            generalLogger.error('MONGODB: ', { message: 'Failed to connect to MongoDB after 5 retries' });
        }
    }
};

mongoose.connection.on('connected', () => {
    generalLogger.info('MONGODB: ', { message: 'Mongoose connected to MongoDB' });
    retries = 0;
});

mongoose.connection.on('error', (err) => {
    generalLogger.error('MONGODB: ', { message: `Mongoose connection error: ${err.message}` });
});

mongoose.connection.on('disconnected', () => {
    generalLogger.warn('MONGODB: ', { message: 'Mongoose disconnected from MongoDB' });
    connectToDatabase();
});

export default connectToDatabase;
