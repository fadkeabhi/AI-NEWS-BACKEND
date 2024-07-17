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
        default: null,
    },
    aiCleanedContent: {
        type: String,
        default: null,
    },
    headline: {
        type: String,
        default: null,
    },
    imageUrl: {
        type: String,
        default: null,
    },
    imageAlt: {
        type: String,
        default: null,
    },
    publishedAt: {
        type: String,
        default: null,
    },
    tags: {
        type: [String],
        default: null,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    summary: {
        type: String,
        default: null,
    },
    questions: {
        type: [{
            question: String,
            answer: String
        }],
        
    },
    isSafetyError: {
        type: Boolean,
        default: false,
    },
});

// Add indexes on the fields
NewsSchema.index({ createdAt: 1 });
NewsSchema.index({ tags: 1 });

// Create a model based on the schema
const News = mongoose.model('News', NewsSchema);

// Ensure indexes are created, including the unique index on the URL
News.init().then(() => {
    console.log("Indexes created");
}).catch(err => {
    console.error("Error creating indexes: ", err);
});

module.exports = News;
