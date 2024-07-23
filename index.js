require('dotenv').config({ path: __dirname + '/.env' })
const cors = require('cors');
const cookieParser = require("cookie-parser");
const express = require('express');
const mongoose = require('mongoose');
const newsRoutes = require('./routes/news');
const AuthRoutes = require("./routes/AuthRoutes")
mongoose.connect(process.env.mongoURL, { family: 4 });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({extended: true}))
app.use(cookieParser())

app.get('/', async (req, res) => {
  res.send("started")
})

app.use('/news', newsRoutes);
app.use("/api/v1/user",AuthRoutes)

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
