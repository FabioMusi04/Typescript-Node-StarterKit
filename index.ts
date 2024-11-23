import express, { Application } from 'express';
import api from './src/api/index.ts';
import config from './src/config.ts';
import cors from 'cors';
import connectToDatabase from './src/services/mongo/mongo.ts';
import passportConfig from './src/services/auth/auth.ts';
import { generalLogger, requestLogger } from './src/services/logger/winston.ts';
import rateLimiter from './src/services/rateLimiting/index.ts';
import speedLimiter from './src/services/DDoSProtection/index.ts';
import helmet from 'helmet';

const app: Application = express();
const port: number = config.port || 3000;

app.use(helmet());
app.use(express.json());

app.use(rateLimiter);
app.use(speedLimiter);
app.use(cors({
    origin: [config.clientUrl],
}));

app.use(requestLogger);

app.use(passportConfig.initialize());

app.use('/', api);

setImmediate(async () => {
    try {
        await connectToDatabase();

        app.listen(port, () => {
            generalLogger.info('SERVER: ', { message: `Server started on port ${port}` });
        });
    } catch (error) {
        generalLogger.error('SERVER: ', { message: error.message });
    }
});
