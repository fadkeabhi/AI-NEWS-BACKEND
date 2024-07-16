const News = require('../models/NewsSchema');
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
};
