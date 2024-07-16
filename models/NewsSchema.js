const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the schema for the scraped news
const NewsSchema = new Schema({
    url: {
        type: String,
        required: true,
        unique: true,
    },
    hostname: {
        type: String,
        required: true,
    },
    rawContent: {
        type: String,
        required: true,
    },
    aiCleanedContent: {
        type: String,
        required: true,
    },
    headline: {
        type: String,
        required: true,
    },
    imageUrl: {
        type: String,
        required: true,
    },
    imageAlt: {
        type: String,
        required: true,
    },
    publishedAt: {
        type: String,
        default: Date.now,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Create a model based on the schema
const News = mongoose.model('News', NewsSchema);

module.exports = News;
