const News = require('../models/NewsSchema'); // Import the News model
const { processSingleNewsWithoutSummary } = require('../utils/crons/summery');

async function getNewsWithPagination(before, after, limit = 5) {
    const query = {};

    if (before) {
        query.newsId = { $lt: before };
    }

    if (after) {
        query.newsId = { $gt: after };
    }

    try {
        const newsList = await News.find(query)
            .select(["_id", "isSafetyError", "hostname", "headline", "imageUrl", "publishedAt", "tags", "newsId"])
            .sort({ newsId: -1 }) // Sort by creation date descending
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
        if (!newsArticle.summary && (!newsArticle.aiProcessingTime || Date.now() - newsArticle.aiProcessingTime > 1000)) {
            console.log("triggered summery for article", newsId);
            newsArticle.aiProcessingTime = Date.now();
            newsArticle.save();
            processSingleNewsWithoutSummary(newsArticle._id);
        }

        res.json(newsArticle);
    } catch (error) {
        console.error('Error fetching news article:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

async function getNewsByTag(tag, limit = 20, skip = 0) {
    try {
        const newsList = await News.find({ tags: { $in: tag } })
            .select(["_id", "isSafetyError", "hostname", "headline", "imageUrl", "publishedAt", "tags", "newsId"])
            .sort({ newsId: -1 })
            .skip(skip)
            .limit(limit);

        return newsList;
    } catch (error) {
        console.error('Error fetching news by tag:', error);
        throw error;
    }
}

async function getUniqueTags() {
    try {
        const tagsWithCounts = await News.aggregate([
            { $match: { tags: { $ne: null, $exists: true } } },
            { $unwind: "$tags" },
            {
                $group: {
                    _id: "$tags",
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 50 }
        ]);
        // Transforming the data
        const transformedData = tagsWithCounts.map(item => ({
            tag: item._id,
            count: item.count
        }));
        return transformedData;
    } catch (error) {
        console.error('Error fetching unique tags:', error);
        return null;
    }
}

module.exports = { getNewsWithPagination, getNewsById, getUniqueTags, getNewsByTag };
