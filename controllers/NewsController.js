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
            .sort({ createdAt: -1 }) // Sort by creation date descending
            .limit(limit); // Limit the number of results

        return newsList;
    } catch (error) {
        console.error('Error fetching news with pagination:', error);
        throw error;
    }
}

module.exports = { getNewsWithPagination };
