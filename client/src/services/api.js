import axios from 'axios';
import config from '../config';

// Create an axios instance with base URL
const api = axios.create({
  baseURL: config.API_BASE_URL,
});

// API services for articles
export const ArticleService = {
  // Get all articles
  getAll: async () => {
    try {
      const response = await api.get('/articles');
      return response.data;
    } catch (error) {
      console.error('Error fetching articles:', error);
      throw error;
    }
  },

  // Get article by ID
  getById: async (id) => {
    try {
      const response = await api.get(`/articles/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching article ${id}:`, error);
      throw error;
    }
  },
  
  // Get all purchased articles for a user
  getPurchasedArticles: async (userAddress) => {
    try {
      const response = await api.get(`/purchases/${userAddress}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching purchased articles:', error);
      return [];
    }
  },

  // Get article content (requires purchase)
  getContent: async (articleId, userAddress) => {
    try {
      const response = await api.post(`/articles/${articleId}/content`, { userAddress });
      return response.data;
    } catch (error) {
      console.error(`Error fetching article content:`, error);
      throw error;
    }
  },

  // Verify if user has purchased the article
  verifyPurchase: async (articleId, userAddress) => {
    try {
      const response = await api.post('/purchases/verify', { articleId, userAddress });
      return response.data.isPurchased;
    } catch (error) {
      console.error('Error verifying purchase:', error);
      return false;
    }
  },

  // Record a purchase
  recordPurchase: async (purchaseData) => {
    try {
      const response = await api.post('/purchases', purchaseData);
      return response.data;
    } catch (error) {
      console.error('Error recording purchase:', error);
      throw error;
    }
  }
};

// API services for blockchain
export const BlockchainService = {
  // Get contract addresses
  getContractAddresses: async () => {
    try {
      const response = await api.get('/contracts');
      return response.data;
    } catch (error) {
      console.error('Error fetching contract addresses:', error);
      throw error;
    }
  },

  // Get user token balance
  getBalance: async (address) => {
    try {
      const response = await api.get(`/balance/${address}`);
      return response.data.balance;
    } catch (error) {
      console.error('Error fetching balance:', error);
      throw error;
    }
  },
};

export default api;
