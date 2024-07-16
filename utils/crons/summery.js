const News = require("../../models/NewsSchema");
const { AIGetNewsSummeryAndQuestionsWithTags } = require("../gemini");

async function processNewsWithoutSummary() {
    try {
        // Find 5 news documents where summary is null
        const newsList = await News.find({ summary: null, isSafetyError: { $ne: true } })
            .sort({ createdAt: -1 })
            .limit(process.env.noOfArticleesToProcessAtOnce);

        // Check if there are any news documents to process
        if (newsList.length === 0) {
            console.log('No news documents with summary as null found.');
            return;
        }

        // Perform operations on each news document
        const updatedNewsList = await Promise.all(newsList.map(async (news) => {

            const genimiResponse = await AIGetNewsSummeryAndQuestionsWithTags(news.rawContent);

            // console.log(genimiResponse)

            if (!genimiResponse.error) {
                // Update the news document with the generated summary and questions
                news.summary = genimiResponse.summary;
                news.tags = genimiResponse.tags;
                news.questions = genimiResponse.questions;

            } else if (genimiResponse.error == "safety") {
                news.isSafetyError = true;
            }

            // Save the updated news document
            await news.save();

            return news;

        }));

        // console.log('Processed and updated news documents:', updatedNewsList);
        console.log('Processed and updated news documents');
    } catch (error) {
        console.error(`Error processing news: ${error.message}`);
        throw error;
    }
}

module.exports = processNewsWithoutSummary;