require('dotenv').config({ path: __dirname + '/.env' })

// const { AIGetNewsSummeryAndQuestions } = require('./utils/gemini')
// const {scrapeIndianExpress} = require('./utils/scrapper')

// const run = async ()=> {
//     const res = await scrapeIndianExpress("https://indianexpress.com/article/world/donald-trump-shooting-recounts-moment-9454120/")
//     console.log(res )
//     const summery = await AIGetNewsSummeryAndQuestions(res.content)
//     console.log(summery)
//     console.log(summery.summary)
// }

// run()


// -------------------------------------------------------------------------------
const mongoose = require('mongoose');

mongoose.connect(process.env.mongoURL, { family: 4 });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

const {rssBBC} = require("./utils/rss/bbc")

rssBBC();

// db.close();

// -------------------------------------------------------------------------------

// const mongoose = require('mongoose');
// const {processNewsWithoutSummaryNew} = require('./utils/crons/summery');

// mongoose.connect(process.env.mongoURL, { family: 4 });

// const db = mongoose.connection;
// db.on('error', console.error.bind(console, 'MongoDB connection error:'));
// db.once('open', () => {
//   console.log('Connected to MongoDB');
// });

// processNewsWithoutSummaryNew()