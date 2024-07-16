require('dotenv').config({ path: __dirname + '/.env' })

const { AIGetNewsSummeryAndQuestions } = require('./utils/gemini')
const {scrapeIndianExpress} = require('./utils/scrapper')

const run = async ()=> {
    const res = await scrapeIndianExpress("https://indianexpress.com/article/world/donald-trump-shooting-recounts-moment-9454120/")
    console.log(res )
    const summery = await AIGetNewsSummeryAndQuestions(res.content)
    console.log(summery)
    console.log(summery.summary)
}

run()