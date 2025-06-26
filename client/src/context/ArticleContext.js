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
  
  const { account, articlePurchaseContract } = useWeb3();

  // Fetch all articles
  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Fetching articles from API...');
      const response = await ArticleService.getAll();
      console.log('📥 API response:', response);
      
      // The API returns articles directly as an array
      if (Array.isArray(response)) {
        setArticles(response);
        console.log('✅ Articles loaded successfully:', response.length, 'articles');
      } else {
        console.error('❌ Invalid response format, expected array but got:', typeof response);
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('❌ Error fetching articles:', error);
      setError(`Failed to load articles: ${error.message}`);
      setArticles([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch a single article by ID
  const fetchArticleById = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await ArticleService.getById(id);
      // The API returns the article directly as an object
      if (response && response._id) {
        setCurrentArticle(response);
        console.log('Article loaded successfully:', response.title);
        return response;
      } else {
        throw new Error('Invalid article response');
      }
    } catch (error) {
      console.error(`Error fetching article ${id}:`, error);
      setError('Failed to load article. Please try again.');
      setCurrentArticle(null);
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
    console.log(`🔍 checkPurchaseStatus called with articleId: ${articleId}, account: ${account}`);
    
    if (!account || !articleId) {
      console.log('❌ Missing account or articleId');
      return false;
    }

    try {
      // Check smart contract directly instead of backend database
      if (articlePurchaseContract) {
        console.log('✅ Using smart contract to check purchase status');
        const hasAccess = await articlePurchaseContract.hasAccess(account, articleId);
        console.log(`🔍 Contract check - User ${account} has access to article ${articleId}:`, hasAccess);
        return hasAccess;
      } else {
        console.warn('⚠️ Article purchase contract not available, falling back to backend');
        const backendResult = await ArticleService.verifyPurchase(articleId, account);
        console.log('🔍 Backend check result:', backendResult);
        return backendResult;
      }
    } catch (error) {
      console.error('❌ Error checking purchase status:', error);
      // Fallback to backend check
      try {
        console.log('🔄 Trying backend fallback...');
        const backendResult = await ArticleService.verifyPurchase(articleId, account);
        console.log('🔍 Backend fallback result:', backendResult);
        return backendResult;
      } catch (backendError) {
        console.error('❌ Backend fallback also failed:', backendError);
        return false;
      }
    }
  }, [account, articlePurchaseContract]);

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
