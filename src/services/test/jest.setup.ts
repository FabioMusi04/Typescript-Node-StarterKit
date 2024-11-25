import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { generalLogger } from '../logger/winston.ts';
import { beforeAll, afterAll } from '@jest/globals';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();

  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  generalLogger.info('Connected to in-memory MongoDB');
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  generalLogger.info('Dropped in-memory MongoDB database');
  await mongoose.connection.close();
  generalLogger.info('Closed in-memory MongoDB connection');

  if (mongoServer) {
    await mongoServer.stop();
    generalLogger.info('Stopped in-memory MongoDB server');
  }
});
