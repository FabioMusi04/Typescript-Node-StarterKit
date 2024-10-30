const express = require('express');
const cors = require('cors')
require('dotenv').config();
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors({
    origin: [process.env.CLIENT_URL],
}));

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.get("/helloboss", (req, res) => {
    res.send("Hello Boss");
});

app.get("/helloboss2", (req, res) => {
    res.send("Hello Boss 2");
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});