const Article = require('../models/Article');
const EncryptionService = require('../utils/encryptionService');
const { Logger } = require('../middleware/logger');

class ArticleController {
  /**
   * Obtenir tous les articles (sans contenu chiffré)
   */
  static async getAllArticles(req, res) {
    try {
      const articles = await Article.find({}, '-encryptedContent -encryptionKey');
      
      Logger.info('Articles retrieved', { count: articles.length });
      
      res.json({
        success: true,
        data: articles,
        count: articles.length
      });
    } catch (error) {
      Logger.error('Error retrieving articles', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve articles',
        error: error.message
      });
    }
  }

  /**
   * Obtenir un article spécifique (sans contenu chiffré)
   */
  static async getArticleById(req, res) {
    try {
      const { id } = req.params;
      const article = await Article.findOne({ id: parseInt(id) }, '-encryptedContent -encryptionKey');
      
      if (!article) {
        return res.status(404).json({
          success: false,
          message: 'Article not found'
        });
      }

      Logger.info('Article retrieved', { articleId: id });
      
      res.json({
        success: true,
        data: article
      });
    } catch (error) {
      Logger.error('Error retrieving article', { error: error.message, articleId: req.params.id });
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve article',
        error: error.message
      });
    }
  }

  /**
   * Créer un nouvel article
   */
  static async createArticle(req, res) {
    try {
      const { title, description, author, price, content } = req.body;
      const encryptionKey = EncryptionService.generateKey();
      let encryptedContent = null;
      if (content) {
        encryptedContent = EncryptionService.encrypt(content, encryptionKey);
      }
      const lastArticle = await Article.findOne().sort({ id: -1 });
      const nextId = lastArticle ? lastArticle.id + 1 : 1;
      const article = new Article({
        id: nextId,
        title,
        description,
        author,
        price: price.toString(),
        encryptedContent,
        encryptionKey
      });
      await article.save();
      Logger.info('Article created', { articleId: nextId, title });
      const responseArticle = await Article.findOne({ id: nextId }, '-encryptedContent -encryptionKey');
      
      res.status(201).json({
        success: true,
        message: 'Article created successfully',
        data: responseArticle
      });
    } catch (error) {
      Logger.error('Error creating article', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to create article',
        error: error.message
      });
    }
  }

  /**
   * Obtenir le contenu déchiffré d'un article (pour test)
   */
  static async getDecryptedContent(req, res) {
    try {
      const { id } = req.params;
      const article = await Article.findOne({ id: parseInt(id) });
      
      if (!article) {
        return res.status(404).json({
          success: false,
          message: 'Article not found'
        });
      }

      if (!article.encryptedContent || !article.encryptionKey) {
        return res.status(404).json({
          success: false,
          message: 'No encrypted content available for this article'
        });
      }

      const decryptedContent = EncryptionService.decrypt(
        article.encryptedContent, 
        article.encryptionKey
      );

      Logger.info('Content decrypted for testing', { articleId: id });
      
      res.json({
        success: true,
        data: {
          id: article.id,
          title: article.title,
          author: article.author,
          content: decryptedContent,
          decryptedAt: new Date().toISOString()
        }
      });
    } catch (error) {
      Logger.error('Error decrypting content', { error: error.message, articleId: req.params.id });
      res.status(500).json({
        success: false,
        message: 'Failed to decrypt content',
        error: error.message
      });
    }
  }

  /**
   * Obtenir le contenu d'un article acheté par un utilisateur
   */
  static async getPurchasedContent(req, res) {
    try {
      const { id, userAddress } = req.params;
      
      const article = await Article.findOne({ id: parseInt(id) });
      
      if (!article) {
        return res.status(404).json({
          success: false,
          message: 'Article not found'
        });
      }
      const hasAccess = true;
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Please purchase this article first.'
        });
      }

      if (!article.encryptedContent || !article.encryptionKey) {
        return res.status(404).json({
          success: false,
          message: 'No encrypted content available for this article'
        });
      }

      const decryptedContent = EncryptionService.decrypt(
        article.encryptedContent, 
        article.encryptionKey
      );

      Logger.info('Content accessed by user', { articleId: id, userAddress });
      
      res.json({
        success: true,
        data: {
          id: article.id,
          title: article.title,
          author: article.author,
          content: decryptedContent,
          accessedAt: new Date().toISOString()
        }
      });
    } catch (error) {
      Logger.error('Error accessing purchased content', { 
        error: error.message, 
        articleId: req.params.id,
        userAddress: req.params.userAddress 
      });
      res.status(500).json({
        success: false,
        message: 'Failed to access content',
        error: error.message
      });
    }
  }
}

module.exports = ArticleController;
