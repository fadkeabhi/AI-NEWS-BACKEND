const axios = require('axios');
const xml2js = require('xml2js');

async function fetchAndParseRSS(url) {
    try {
        // Fetch the RSS feed
        const response = await axios.get(url);
        const rssData = response.data;

        // Parse the RSS feed
        const parser = new xml2js.Parser();
        const rssJson = await parser.parseStringPromise(rssData);

        return rssJson;
    } catch (error) {
        throw new Error(`Error fetching or parsing RSS feed: ${error.message}`);
    }
}

module.exports = {fetchAndParseRSS}

