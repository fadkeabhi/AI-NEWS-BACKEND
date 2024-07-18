const axios = require('axios');
const JSSoup = require('jssoup').default;

async function scrapeHindustanTimes(url) {
    try {
        const response = await axios.get(url);
        const soup = new JSSoup(response.data);

        const headlineContainer = soup.find('meta', { property: 'og:title' })
        // Extract the headline
        const headline = headlineContainer ? headlineContainer.attrs.content : ' ';
        // console.log(headline)


        // Find the main story details container
        const storyDetailsContainer = soup.find('div', 'storyDetails');

        const rawContent = storyDetailsContainer.getText()


        const publishedAt = soup.find('div', 'dateTime').text

        // Extract the image URL and alt text
        const image = storyDetailsContainer.find('img');
        const imageUrl = image ? image.attrs.src : null;
        const imageAlt = image ? image.attrs.alt : null;

        return { headline, rawContent, imageUrl, imageAlt, publishedAt, url, hostname:"hindustantimes.com" };
    } catch (error) {
        console.error(`Error scraping Hindustan Times: ${error.message}`);
        return { error: `Failed to scrape ${url}` };
    }
}


async function scrapeIndianExpress(url) {
    try {
        const response = await axios.get(url);
        const soup = new JSSoup(response.data);

        const headlineContainer = soup.find('meta', { property: 'og:title' })
        // Extract the headline
        const headline = headlineContainer ? headlineContainer.attrs.content : ' ';

        const scriptTags = soup.findAll('script', { type: 'application/ld+json' });

        for (let scriptTag of scriptTags) {
            const ldJsonContent = scriptTag.text;
            try {
                const jsonData = JSON.parse(ldJsonContent);
                if (jsonData.articleBody) {
                    // console.log('LD+JSON content with articleBody:', jsonData);
                    const headline = jsonData.headline;
                    const rawContent = jsonData.articleBody;
                    const imageUrl = jsonData.image?.url || jsonData.image;
                    const imageAlt = jsonData.headline;
                    const publishedAt = jsonData.datePublished;
                    return { headline, rawContent, imageUrl, imageAlt, publishedAt, url, hostname:"indianexpress.com"  };
                }
            } catch (error) {
                console.error('Error parsing JSON:', error);
            }
        }


    } catch (error) {
        console.error(`Error scraping Hindustan Times: ${error.message}`);
        return { error: `Failed to scrape ${url}` };
    }
}

module.exports = {
    'hindustantimes.com': scrapeHindustanTimes,
    'indianexpress.com': scrapeIndianExpress,
};
