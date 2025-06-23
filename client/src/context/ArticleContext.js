import React, { createContext, useState, useEffect, useCallback } from 'react';
import { ArticleService } from '../services/api';
import { useWeb3 } from './Web3Context';

// Create context
export const ArticleContext = createContext();

// Provider component
export const ArticleProvider = ({ children }) => {
  const [articles, setArticles] = useState([]);
  const [currentArticle, setCurrentArticle] = useState(null);
  const [articleContent, setArticleContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [purchasedArticles, setPurchasedArticles] = useState([]);
  
  const { account } = useWeb3();

  // Fetch all articles
  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true);
      const response = await ArticleService.getAll();
      if (response.success && response.data) {
        setArticles(response.data);
      } else {
        throw new Error('Failed to fetch articles');
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
      setError('Failed to load articles. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch a single article by ID
  const fetchArticleById = useCallback(async (id) => {
    try {
      setLoading(true);
      const response = await ArticleService.getById(id);
      if (response.success && response.data) {
        setCurrentArticle(response.data);
        return response.data;
      } else {
        throw new Error('Failed to fetch article');
      }
    } catch (error) {
      console.error(`Error fetching article ${id}:`, error);
      setError('Failed to load article. Please try again.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch article content (requires purchase)
  const fetchArticleContent = useCallback(async (articleId) => {
    if (!account) {
      setError('Please connect your wallet to view article content');
      return;
    }

    try {
      setLoading(true);
      const response = await ArticleService.getContent(articleId, account);
      if (response.content) {
        setArticleContent(response.content);
        return response.content;
      } else {
        throw new Error('Failed to fetch article content');
      }
    } catch (error) {
      console.error('Error fetching article content:', error);
      if (error.response && error.response.status === 403) {
        setError('You need to purchase this article to view the content');
      } else {
        setError('Failed to load article content. Please try again.');
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, [account]);

  // Check if user has purchased an article
  const checkPurchaseStatus = useCallback(async (articleId) => {
    if (!account || !articleId) return false;

    try {
      return await ArticleService.verifyPurchase(articleId, account);
    } catch (error) {
      console.error('Error checking purchase status:', error);
      return false;
    }
  }, [account]);

  // Fetch all purchased articles for the current user
  const fetchPurchasedArticles = useCallback(async () => {
    if (!account) return;

    try {
      setLoading(true);
      const response = await ArticleService.getPurchasedArticles(account);
      setPurchasedArticles(response);
    } catch (error) {
      console.error('Error fetching purchased articles:', error);
    } finally {
      setLoading(false);
    }
  }, [account]);

  // Load articles on initial render
  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  // Load purchased articles when account changes
  useEffect(() => {
    if (account) {
      fetchPurchasedArticles();
    } else {
      setPurchasedArticles([]);
    }
  }, [account, fetchPurchasedArticles]);

  return (
    <ArticleContext.Provider
      value={{
        articles,
        currentArticle,
        articleContent,
        loading,
        error,
        purchasedArticles,
        fetchArticles,
        fetchArticleById,
        fetchArticleContent,
        checkPurchaseStatus,
        fetchPurchasedArticles,
      }}
    >
      {children}
    </ArticleContext.Provider>
  );
};

// Custom hook to use the Article context
export const useArticle = () => {
  const context = React.useContext(ArticleContext);
  if (context === undefined) {
    throw new Error('useArticle must be used within an ArticleProvider');
  }
  return context;
};
