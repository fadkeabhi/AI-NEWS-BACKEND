const { batchCreateNews } = require("../mongoNews");
const { fetchAndParseRSS } = require("../rssFetchParse");

const scrapers = require("../../utils/scrapper");
const { delay } = require("../time");
const News = require("../../models/NewsSchema");
const hostname = "hindustantimes.com"
const scraper = scrapers[hostname]

const rssLinks = {
    "India": "https://www.hindustantimes.com/feeds/rss/india-news/rssfeed.xml",
    "world": "https://www.hindustantimes.com/feeds/rss/world-news/rssfeed.xml",
    "us": "https://www.hindustantimes.com/feeds/rss/world-news/us-news/rssfeed.xml",
};


async function batchScrapper(newsList) {

    // Filter out news articles with duplicate URLs
    const urls = newsList.map(news => news.url);
    const existingNews = await News.find({ url: { $in: urls } });
    const existingUrls = new Set(existingNews.map(news => news.url));
    const filteredNewsArticles = newsList.filter(news => !existingUrls.has(news.url));

    console.log(filteredNewsArticles.length)

    let finalNewsList = []
    await Promise.all(filteredNewsArticles.map(async (news) => {
        const fetchedNews = await scraper(news.url)
        if(!fetchedNews?.error){
            finalNewsList.push(fetchedNews)
        }
    }))

    batchCreateNews(finalNewsList);
    // console.log(finalNewsList[0])



}


async function rssUtil(url) {
    try {
        // Fetch the RSS feed
        const rssJson = await fetchAndParseRSS(url);

        newsRaw = rssJson.rss.channel[0].item;

        // console.log(newsRaw);

        let finalNews = []

        newsRaw.forEach(i => {
            let news = {
                url: i.link[0] || null,
                hostname: "ndtv.com",
                // rawContent : i["content:encoded"][0],
                headline: i.title[0],
                imageUrl: i["media:content"][0]["$"]["url"],
                publishedAt: i.pubDate[0],
            }

            finalNews.push(news)
            // console.log(news)    
        });

        console.log(finalNews.length)

        batchScrapper(finalNews)
        return;

        // save scrapped news to db
        await batchCreateNews(finalNews)



    } catch (error) {
        console.error('Error fetching RSS feed:', error);
    }
}

async function rssHindustanTimes() {
    try {
        for (const [category, link] of Object.entries(rssLinks)) {
            try {
                await rssUtil(link);
                console.log("RSS Fetched " + category);
            } catch (error) {
                console.error("An error occurred while fetching the RSS feed for " + category + ":", error);
            }
        }
        console.log("All RSS feeds fetched successfully.");
    } catch (error) {
        console.error('Error fetching RSS feeds:', error);
    }
}

module.exports = { rssHindustanTimes }

