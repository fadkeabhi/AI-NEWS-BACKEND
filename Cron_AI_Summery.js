require('dotenv').config({ path: __dirname + '/.env' })
const mongoose = require('mongoose');

mongoose.connect(process.env.mongoURL, { family: 4 });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

const { processNewsWithoutSummaryNew } = require("./utils/crons/summery")

async function call() {
    while (true) {
        await processNewsWithoutSummaryNew();
        await new Promise(resolve => setTimeout(resolve, 20000));
    }
}

call()
