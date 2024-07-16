require('dotenv').config({ path: __dirname + '/.env' })

const express = require('express');
const mongoose = require('mongoose');


mongoose.connect(process.env.mongoURL, { family: 4 });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

const newsRoutes = require('./routes/news');

const app = express();


app.get('/', async (req, res) => {
  res.send("started")
})

app.use('/news', newsRoutes);


const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
