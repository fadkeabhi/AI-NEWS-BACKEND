// routes/user.js
const express = require('express');
const url = require('url');
const router = express.Router();
const scrapers = require("../utils/scrapper")
const {AIGetNewsFromRaw} = require("../utils/gemini")

const { createNews, getNewsByUrl } = require("../utils/mongoNews");
const { formatDateTime } = require('../utils/time');



// Route to get a user by ID
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