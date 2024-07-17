const News = require('../models/NewsSchema'); // Import the News model

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
            .select(["_id", "isSafetyError", "hostname", "headline", "imageUrl", "publishedAt", "tags"])
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

        if (!newsArticle) {
            return res.status(404).json({ message: 'News article not found' });
        }

        res.json(newsArticle);
    } catch (error) {
        console.error('Error fetching news article:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = { getNewsWithPagination, getNewsById };
