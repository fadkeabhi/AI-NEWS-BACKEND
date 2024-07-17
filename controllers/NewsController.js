const News = require('../models/NewsSchema'); // Import the News model
const { processSingleNewsWithoutSummary } = require('../utils/crons/summery');

async function getNewsWithPagination(before, after, limit = 5) {
    const query = {};

    if (before) {
        query.createdAt = { $lt: new Date(before) };
    }

    if (after) {
        query.createdAt = { $gt: new Date(after) };
    }

    try {
        const newsList = await News.find(query)
            .select(["_id", "isSafetyError", "hostname", "headline", "imageUrl", "publishedAt", "tags", "createdAt"])
            .sort({ createdAt: -1 }) // Sort by creation date descending
            .limit(limit); // Limit the number of results

        return newsList;
    } catch (error) {
        console.error('Error fetching news with pagination:', error);
        throw error;
    }
}


async function getNewsById(req, res) {
    try {
        const newsId = req.params.id;
        const newsArticle = await News.findById(newsId);

        // if news not found
        if (!newsArticle) {
            return res.status(404).json({ message: 'News article not found' });
        }

        // if news does not have a summery trigger summery generation for news
        if (!newsArticle.summary){
            console.log("triggered summery for article", newsId)
            processSingleNewsWithoutSummary(newsArticle._id);
        }

        res.json(newsArticle);
    } catch (error) {
        console.error('Error fetching news article:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = { getNewsWithPagination, getNewsById };
