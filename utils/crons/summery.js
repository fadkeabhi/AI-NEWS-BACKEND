const News = require("../../models/NewsSchema");
const { AIGetNewsSummeryAndQuestionsWithTags, AIGetNewsSummeryAndQuestionsWithTagsInBulk } = require("../gemini");

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

            if (!genimiResponse?.error) {
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
    }
}

async function processNewsWithoutSummaryNew() {

    async function helper(newsList) {
        const genimiResponse = await AIGetNewsSummeryAndQuestionsWithTagsInBulk(JSON.stringify(newsList));
        if (!genimiResponse?.error) {
            // console.log("no error")
            for (const article of genimiResponse.data) {
                // console.log(article._id)
                // console.log(article.summary)
                // console.log(article.tags)
                // console.log(article.questions)

                const updatedArticle = await News.findByIdAndUpdate(
                    article._id,
                    {
                        summary: article.summary,
                        tags: article.tags,
                        questions: article.questions
                    },
                    { new: true }
                );
            }
        } else if (genimiResponse.error == "safety") {
            console.log("safety issue");
        } else if (genimiResponse.error == "json") {
            console.log("json issue");
        } 
        console.log('Processed and updated news documents');
    }

    try {
        // Find 5 news documents where summary is null
        const noRequests = process.env.noOfRequestsSentAtOnce
        const noArticlesInRequest = process.env.noOfArticleesToProcessAtOnceInOneRequest
        const newsList = await News.find({ summary: null, isSafetyError: { $ne: true } })
            .sort({ createdAt: -1 })
            .limit(noArticlesInRequest * noRequests)
            .select(["_id", "rawContent"]);

        let newsCount = newsList.length;

        // Check if there are any news documents to process
        if (newsCount === 0) {
            console.log('No news documents with summary as null found.');
            return;
        }

        let requestCount = 0;
        while (newsCount > 0) {
            var newNewsList = [];
            let limit = newsCount;
            if (newsCount > noArticlesInRequest) {
                limit = noArticlesInRequest;
            }
            for (let i = 0; i < limit; i++) {
                newNewsList.push(newsList[requestCount * noArticlesInRequest + i]);
            }
            console.log(newNewsList.length)
            newsCount -= noArticlesInRequest;
            requestCount++;

            helper(newNewsList);

        }

    } catch (error) {
        console.error(`Error processing news: ${error.message}`);
    }
}


async function processSingleNewsWithoutSummary(id) {
    try {
        // Find 5 news documents where summary is null
        const newsArticle = await News.findById(id);

        // Check if there are any news documents to process
        if (!newsArticle) {
            console.log('News not found.');
            return;
        }


        const genimiResponse = await AIGetNewsSummeryAndQuestionsWithTags(newsArticle.rawContent);

        // console.log(genimiResponse)

        if (!genimiResponse?.error) {
            // Update the news document with the generated summary and questions
            newsArticle.summary = genimiResponse.summary;
            newsArticle.tags = genimiResponse.tags;
            newsArticle.questions = genimiResponse.questions;

        } else if (genimiResponse.error == "safety") {
            newsArticle.isSafetyError = true;
        }

        // Save the updated news document
        await newsArticle.save();

        // console.log('Processed and updated news documents:', updatedNewsList);
        console.log('Processed and updated news documents');
    } catch (error) {
        console.error(`Error processing news: ${error.message}`);
    }
}

module.exports = { processNewsWithoutSummary, processSingleNewsWithoutSummary, processNewsWithoutSummaryNew };