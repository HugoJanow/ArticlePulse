const express = require('express');
const ArticleController = require('../controllers/articleController');
const { 
  validateArticleId, 
  validateEthereumAddress 
} = require('../middleware/validation');

const router = express.Router();

/**
 * @route   GET /api/content/:id/:userAddress
 * @desc    Obtenir le contenu déchiffré d'un article acheté
 * @access  Private (nécessite l'achat de l'article)
 */
router.get(
  '/:id/:userAddress', 
  validateArticleId, 
  validateEthereumAddress,
  ArticleController.getPurchasedContent
);

module.exports = router;
