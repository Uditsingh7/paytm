const express = require("express");
const { router } = require('./src/routes/index');
const cors = require("cors");
const connectDb = require('./db');
const app = express();



app.use(express.json());
app.use(cors());

app.use('/api/v1', router);
app.listen(8787, () => {
    console.log('Server is running on port 3001');
    connectDb();
})

