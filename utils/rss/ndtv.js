const { batchCreateNews } = require("../mongoNews");
const { fetchAndParseRSS } = require("../rssFetchParse");

const rssLinks = {
    "Top Stories": "https://feeds.feedburner.com/ndtvnews-top-stories",
    "Latest Stories": "https://feeds.feedburner.com/ndtvnews-latest",
    "Trending Stories": "https://feeds.feedburner.com/ndtvnews-trending-news",
    // "India": "https://feeds.feedburner.com/ndtvnews-india-news",
    // "World": "https://feeds.feedburner.com/ndtvnews-world-news",
    // // "Business": "https://feeds.feedburner.com/ndtvprofit-latest",
    // "Movies": "https://feeds.feedburner.com/ndtvmovies-latest",
    // "Sports": "https://feeds.feedburner.com/ndtvsports-latest",
    // "Cricket": "https://feeds.feedburner.com/ndtvsports-cricket",
    // "Tech": "https://feeds.feedburner.com/gadgets360-latest",
    // // "Auto": "https://feeds.feedburner.com/carandbike-latest",
    // "Cities": "https://feeds.feedburner.com/ndtvnews-cities-news",
    // "South": "https://feeds.feedburner.com/ndtvnews-south",
    // "Indians Abroad": "https://feeds.feedburner.com/ndtvnews-indians-abroad",
    // "Health": "https://feeds.feedburner.com/ndtvcooks-latest",
    // "Offbeat": "https://feeds.feedburner.com/ndtvnews-offbeat-news",
    // "People": "https://feeds.feedburner.com/ndtvnews-people",
    // // "Hindi": "https://feeds.feedburner.com/ndtvkhabar-latest",
    // // "Videos": "https://feeds.feedburner.com/ndtv/latest-videos",
};


async function rssNDTVUtil(url) {
    try {
        // Fetch the RSS feed
        const rssJson = await fetchAndParseRSS(url);

        newsRaw = rssJson.rss.channel[0].item;

        let finalNews = []

        newsRaw.forEach(i => {
            let news = {
                url : i.link[0] || null,
                hostname : "ndtv.com",
                rawContent : i["content:encoded"][0],
                headline : i.title[0],
                imageUrl : i["media:content"][0]["$"]["url"],
                publishedAt : i.pubDate[0],
            }

            finalNews.push(news)
            // console.log(news)    
        });

        console.log(finalNews.length)

        // save scrapped news to db
        await batchCreateNews(finalNews)



    } catch (error) {
        console.error('Error fetching RSS feed:', error);
    }
}

async function rssNDTV() {
    try {
        const promises = Object.entries(rssLinks).map(async ([category, link]) => {
            await rssNDTVUtil(link);
            console.log("RSS Fetched " + category);
        });

        await Promise.all(promises);
    } catch (error) {
        console.error('Error fetching RSS feeds:', error);
    }
}

module.exports = { rssNDTV }

