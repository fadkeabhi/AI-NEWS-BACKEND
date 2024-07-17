const News = require('../models/NewsSchema');
const {getNextSequenceValues} = require('../models/CounterSchema');
const mongoose = require('mongoose');

// Create a new news article
async function createNews(newsData) {
  try {
    const { url } = newsData;

    // Check if news with the same URL already exists
    const existingNews = await News.findOne({ url });

    if (existingNews) {
      console.log('News already exists:', existingNews);
      return existingNews._id;
    }

    const newNews = new News(newsData);
    await newNews.save();

    console.log('News created:', newNews.url);
    return newNews._id;
  } catch (error) {
    console.error('Error creating news:', error);
    throw error;
  }
}

// function to batch create news articles
async function batchCreateNews(newsArticles) {
  try {
      // Filter out news articles with duplicate URLs
      const urls = newsArticles.map(news => news.url);
      const existingNews = await News.find({ url: { $in: urls } });
      const existingUrls = new Set(existingNews.map(news => news.url));
      const newNewsArticles = newsArticles.filter(news => !existingUrls.has(news.url));


      // console.log(newNewsArticles.length)
      // console.log(newNewsArticles[0])
      
      // Generate sequential IDs for all news articles
      const { startValue, endValue } = await getNextSequenceValues('newsId', newNewsArticles.length);
        const newsWithIds = newNewsArticles.map((news, index) => ({
            ...news,
            newsId: startValue + index
        }));

      // Insert new news articles into the database
      if (newsWithIds.length > 0) {
          const result = await News.insertMany(newsWithIds);
          console.log('Batch insert successful');
      } else {
          console.log('No new news articles to insert');
      }
  } catch (error) {
      if (error.code === 11000) { // Duplicate key error
          console.log('Duplicate news detected, skipping...');
      } else {
          console.error('Error in batch insert:', error);
      }
  }
}



// Updates a news document in the MongoDB database.
async function updateNews(newsId, updatedFields) {
  try {
    // Find the news document by ID and update it with the provided fields
    const updatedNews = await News.findByIdAndUpdate(
      newsId,
      { $set: updatedFields },
      { new: true, runValidators: true }
    );

    // If no document is found, return an error message
    if (!updatedNews) {
      throw new Error('News document not found');
    }

    // Return the updated news document
    return updatedNews;
  } catch (error) {
    // Handle any errors that occur during the update
    console.error(`Error updating news: ${error.message}`);
    throw error;
  }
}

// Get news article by URL
async function getNewsByUrl(url) {
  try {
    const news = await News.findOne({ url });

    if (!news) {
      return null;
    }

    return news;
  } catch (error) {
    console.error('Error retrieving news:', error);
    throw error;
  }
}

module.exports = {
  createNews,
  getNewsByUrl,
  batchCreateNews,
  updateNews,
};
