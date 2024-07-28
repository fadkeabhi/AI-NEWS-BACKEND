const { batchCreateNews } = require("../mongoNews");
const { fetchAndParseRSS } = require("../rssFetchParse");
const News = require("../../models/NewsSchema");
const scrapers = require("../../utils/scrapper");

const hostname = "bbc.co.uk"
const scraper = scrapers[hostname]

const rssLinks = {
    "World": "https://feeds.bbci.co.uk/news/world/rss.xml",
    "UK": "https://feeds.bbci.co.uk/news/uk/rss.xml",
    "Business": "https://feeds.bbci.co.uk/news/business/rss.xml",
    "Politics": "https://feeds.bbci.co.uk/news/politics/rss.xml",
    "Science_and_environment": "https://feeds.bbci.co.uk/news/science_and_environment/rss.xml",
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
        if (!fetchedNews?.error) {
            finalNewsList.push(fetchedNews)
        }
    }))

    batchCreateNews(finalNewsList);
    // console.log(finalNewsList[0])
}


async function rssBBCUtil(url) {
    try {
        // Fetch the RSS feed
        const rssJson = await fetchAndParseRSS(url);

        newsRaw = rssJson.rss.channel[0].item;
        // console.log(newsRaw[0])
        // console.log(newsRaw[0].title[0])
        // console.log(newsRaw[0].pubDate[0])
        // console.log(newsRaw[0].link[0])
        // console.log(newsRaw[0]["media:thumbnail"][0]["$"].url)


        let finalNews = []

        newsRaw.forEach(i => {

            try {
                let news = {
                    url: i.link[0] || null,
                    hostname: "bbc.co.uk",
                    headline: i.title[0],
                    imageUrl: i["media:thumbnail"][0]["$"]["url"],
                    publishedAt: i.pubDate[0],
                };
                finalNews.push(news);
            } catch (error) {
                console.error('Error processing news:', error);
            }
            // console.log(news)    
        });

        console.log(finalNews.length)

        batchScrapper(finalNews)
        return;


    } catch (error) {
        console.error('Error fetching RSS feed:', error);
    }
}

async function rssBBC() {
    try {

        // console.log(await scraper("https://www.bbc.com/news/articles/cy08dp4kl9mo"))
        // return
        const promises = Object.entries(rssLinks).map(async ([category, link]) => {
            await rssBBCUtil(link);
            console.log("RSS Fetched " + category);
        });

        await Promise.all(promises);
    } catch (error) {
        console.error('Error fetching RSS feeds:', error);
    }
}

module.exports = { rssBBC }

