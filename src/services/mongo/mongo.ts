import mongoose from 'mongoose';
import config from '../../config.ts';

const mongoUri = config.mongo.uri;
const maxRetries = 5;
let retries = 0;

if (!mongoUri) {
    console.error("MongoDB URI not found in environment variables. Check your .env file.");
    process.exit(1);
}

const connectToDatabase = async () => {
    try {
        await mongoose.connect(mongoUri);
        console.log('Successfully connected to MongoDB');
    } catch (error) {
        console.error(`MongoDB connection error: ${error.message}`);

        if (retries < maxRetries) {
            retries += 1;
            console.log(`Retrying connection attempt ${retries}/${maxRetries}...`);
            setTimeout(connectToDatabase, 5000);
        } else {
            console.error("Exceeded maximum connection attempts. Exiting.");
            process.exit(1);
        }
    }
};

mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to database');
    retries = 0;
});

mongoose.connection.on('error', (err) => {
    console.error(`Mongoose connection error: ${err}`);
});

mongoose.connection.on('disconnected', () => {
    console.warn('Mongoose disconnected. Attempting to reconnect...');
    connectToDatabase();
});

const gracefulShutdown = (signal: string) => {
    mongoose.connection.close().then(() => {
        console.log(`Mongoose disconnected through ${signal}. Closing app.`);
        process.exit(0);
    });
};

process.on('SIGINT', () => gracefulShutdown('app termination (SIGINT)'));
process.on('SIGTERM', () => gracefulShutdown('app termination (SIGTERM)'));

export default connectToDatabase;
