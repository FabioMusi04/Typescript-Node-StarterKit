import express, { Application } from 'express';
import api from './src/api/index.ts';
import config from './src/config.ts';
import cors from 'cors';
import connectToDatabase from './src/services/mongo/mongo.ts';
import passportConfig from './src/services/auth/auth.ts';

const app: Application = express();
const port: number = config.port || 3000;

app.use(passportConfig.initialize());

app.use(express.json());
app.use(cors({
    origin: [config.clientUrl],
}));


app.use('/', api);

setImmediate(async () => {
    try {
        await connectToDatabase();

        app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
        });
    } catch (error) {
        console.error('Error connecting to MongoDB', error);
    }
});
