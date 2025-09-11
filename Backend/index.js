
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();


const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());


app.get('/', (req, res) => {
    res.send('Hello from the backend!');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});