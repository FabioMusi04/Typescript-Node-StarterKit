const express = require('express');
const cors = require('cors')
const app = express();
const port = 3000;

app.use(express.json());
app.use(cors({
    origin: true, // Allows requests from any origin
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true, // Allows cookies if needed
}));

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.get("/helloboss", (req, res) => {
    res.send("Hello Boss");
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});