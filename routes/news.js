// routes/user.js
const express = require('express');
const url = require('url');
const router = express.Router();
const scrapers = require("../utils/scrapper")
const {AIGetNewsFromRaw} = require("../utils/gemini")
const { verifyJWT } = require ("../middleware/AuthMiddleware.js");

const { createNews, getNewsByUrl } = require("../utils/mongoNews");
const { formatDateTime } = require('../utils/time');
const { getNewsWithPagination, getNewsById } = require('../controllers/NewsController');
const { rssNDTV } = require('../utils/rss/ndtv');
const {processNewsWithoutSummary, processNewsWithoutSummaryNew} = require('../utils/crons/summery');
const { rssHindustanTimes } = require('../utils/rss/hindustantimes');


// Fetch news articles with pagination
router.get('/', async (req, res) => {
    let { before, after, limit } = req.query;
    try {
        if(!limit){limit = 5};
        const news = await getNewsWithPagination(before, after, parseInt(limit));
        res.status(200).json(news);
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Error fetching news articles', error });
    }
});

// Route to get a single news article by ID
router.get('/:id', getNewsById);
router.get('/:id/secured', verifyJWT, getNewsById);


// Initialise NDTV RSS
router.get('/invoke/rss/ndtv', async (req, res) => {
    try {
        rssNDTV();
        res.status(200).json({status:"invoked"});
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Error fetching news articles', error });
    }
});

// Initialise Hindustan Times RSS
router.get('/invoke/rss/ht', async (req, res) => {
    try {
        rssHindustanTimes();
        res.status(200).json({status:"invoked"});
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Error fetching news articles', error });
    }
});


// Initialise NDTV RSS
router.get('/invoke/ai/summery', async (req, res) => {
    try {
        console.log("AI summery invoked")
        processNewsWithoutSummary();
        res.status(200).json({status:"invoked"});
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Error invoking ai summery', error });
    }
});

// Initialise NDTV RSS
router.get('/invoke/ai/summery/new', async (req, res) => {
    try {
        console.log("AI summery invoked")
        processNewsWithoutSummaryNew();
        res.status(200).json({status:"invoked"});
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Error invoking ai summery', error });
    }
});



router.get('/scrap', async (req, res) => {
    try {
        const inputUrl = req.query.url;
        const parsedUrl = new URL(inputUrl);
        let hostname = parsedUrl.hostname;

        // Check if url already scrapped
        let oldResult = await getNewsByUrl(parsedUrl.href);
        if(oldResult){
            res.json(oldResult);
            return;
        }

        // Remove "www" from the beginning of the hostname if it exists
        if (hostname.startsWith('www.')) {
            hostname = hostname.substring(4);
        }

        const scraper = scrapers[hostname];
        
        if (scraper) {
            let result = await scraper(inputUrl);
            let cleanedContent = null;
            cleanedContent = await AIGetNewsFromRaw(result.content)
            result.url = parsedUrl.href;
            result.hostname = hostname;
            result.rawContent = result.content;
            result.aiCleanedContent = cleanedContent || result.content;
            result.publishedAt = formatDateTime(result.publishedAt);
            delete result.content

            await createNews(result)
            res.json(result);
        } else {
            res.status(400).json({ error: 'Unsupported site' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});




module.exports = router;