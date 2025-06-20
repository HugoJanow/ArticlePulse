const express = require('express');
const ArticleController = require('../controllers/articleController');
const { 
  validateArticle, 
  validateArticleId, 
  validateEthereumAddress 
} = require('../middleware/validation');

const router = express.Router();

/**
 * @route   GET /api/articles
 * @desc    Obtenir tous les articles (sans contenu chiffré)
 * @access  Public
 */
router.get('/', ArticleController.getAllArticles);

/**
 * @route   GET /api/articles/:id
 * @desc    Obtenir un article spécifique (sans contenu chiffré)
 * @access  Public
 */
router.get('/:id', validateArticleId, ArticleController.getArticleById);

/**
 * @route   POST /api/articles
 * @desc    Créer un nouvel article
 * @access  Admin (pour l'instant public pour la démo)
 */
router.post('/', validateArticle, ArticleController.createArticle);

/**
 * @route   GET /api/articles/:id/decrypt-test
 * @desc    Endpoint de test pour déchiffrer le contenu (à retirer en production)
 * @access  Development only
 */
router.get('/:id/decrypt-test', validateArticleId, ArticleController.getDecryptedContent);

module.exports = router;
