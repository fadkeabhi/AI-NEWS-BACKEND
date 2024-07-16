const { batchCreateNews } = require("../mongoNews");
const { fetchAndParseRSS } = require("../rssFetchParse");

async function rssNDTV(url) {
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

module.exports = { rssNDTV }

