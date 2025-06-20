const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const crypto = require('crypto');
require('dotenv').config();

// Import des services et modèles
const Article = require('./models/Article');
const Purchase = require('./models/Purchase');
const blockchainService = require('./services/blockchain');
const modernEncryption = require('./utils/modernEncryption');

// Fonction pour déchiffrer le contenu
function decryptContent(encryptedContent, key) {
  try {
    // Essayer d'abord avec le nouveau système de chiffrement
    if (encryptedContent.includes(':')) {
      return modernEncryption.decrypt(encryptedContent, key);
    } else {
      // Fallback vers l'ancienne méthode pour les données existantes
      console.warn('⚠️  Utilisation du déchiffrement legacy pour les données existantes');
      return modernEncryption.decryptLegacy(encryptedContent, key);
    }
  } catch (error) {
    console.error('Erreur de déchiffrement:', error);
    return null;
  }
}

const app = express();
app.use(cors());
app.use(express.json());

// Connexion MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/articlepulse')
.then(() => {
  console.log('📦 Connected to MongoDB');
}).catch((error) => {
  console.error('❌ MongoDB connection error:', error);
});

// 📚 ROUTES ARTICLES

// Obtenir tous les articles (sans contenu chiffré)
app.get('/api/articles', async (req, res) => {
  try {
    const articles = await Article.find({}, '-encryptedContent -encryptionKey');
    res.json(articles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtenir un article spécifique (sans contenu chiffré)
app.get('/api/articles/:id', async (req, res) => {
  try {
    let article;
    
    // Essayer d'abord avec _id MongoDB
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      article = await Article.findById(req.params.id, '-encryptedContent -encryptionKey');
    }
    
    // Si pas trouvé, essayer avec le champ id numérique
    if (!article) {
      article = await Article.findOne({ id: req.params.id }, '-encryptedContent -encryptionKey');
    }
    
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }
    res.json(article);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Créer un nouvel article (admin)
app.post('/api/articles', async (req, res) => {
  try {
    const article = new Article(req.body);
    await article.save();
    res.status(201).json(article);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Endpoint temporaire avec données hardcodées (pour contourner le problème MongoDB)
app.get('/api/articles-demo', (req, res) => {
  const demoArticles = [
    {
      "_id": "temp1",
      "id": 1,
      "title": "Introduction à la Blockchain",
      "description": "Un guide complet pour comprendre les bases de la technologie blockchain et ses applications.",
      "price": "100000000000000000",
      "author": "Dr. Sarah Blockchain",
      "createdAt": "2025-06-16T13:53:10.471Z"
    },
    {
      "_id": "temp2",
      "id": 2,
      "title": "Smart Contracts avec Solidity",
      "description": "Apprenez à développer des contrats intelligents robustes avec Solidity et les meilleures pratiques.",
      "price": "150000000000000000",
      "author": "Prof. Alex Ethereum",
      "createdAt": "2025-06-16T13:53:10.477Z"
    },
    {
      "_id": "temp3",
      "id": 3,
      "title": "DeFi : L'Avenir de la Finance",
      "description": "Explorez l'écosystème DeFi et découvrez comment la finance décentralisée révolutionne le secteur financier.",
      "price": "200000000000000000",
      "author": "Maria DeFiExpert",
      "createdAt": "2025-06-16T13:53:10.479Z"
    }
  ];
  
  console.log('📚 Returning demo articles');
  res.json(demoArticles);
});

// 🔓 NOUVEAU: Endpoint de test pour déchiffrer le contenu d'un article
app.get('/api/articles/:id/decrypt-test', async (req, res) => {
  try {
    const article = await Article.findOne({ id: req.params.id });
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    if (!article.encryptedContent || !article.encryptionKey) {
      return res.status(404).json({ error: 'No encrypted content available for this article' });
    }

    // Déchiffrer le contenu (en production, ceci serait sécurisé)
    const decryptedContent = decryptContent(article.encryptedContent, article.encryptionKey);
    
    if (!decryptedContent) {
      return res.status(500).json({ error: 'Failed to decrypt content' });
    }

    res.json({
      id: article.id,
      title: article.title,
      author: article.author,
      content: decryptedContent,
      decryptedAt: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🔓 Endpoint sécurisé pour lire le contenu d'un article acheté
app.get('/api/content/:id/:userAddress', async (req, res) => {
  try {
    const { id, userAddress } = req.params;
    
    // Vérifier que l'article existe
    const article = await Article.findOne({ id: parseInt(id) });
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // TODO: En production, vérifier via smart contract que l'utilisateur a acheté l'article
    // Pour l'instant, on simule l'accès autorisé
    const hasAccess = true; // await purchaseContract.hasAccess(userAddress, id);
    
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied. Please purchase this article first.' });
    }

    if (!article.encryptedContent || !article.encryptionKey) {
      return res.status(404).json({ error: 'No encrypted content available for this article' });
    }

    // Déchiffrer le contenu
    const decryptedContent = decryptContent(article.encryptedContent, article.encryptionKey);
    
    if (!decryptedContent) {
      return res.status(500).json({ error: 'Failed to decrypt content' });
    }

    res.json({
      id: article.id,
      title: article.title,
      author: article.author,
      content: decryptedContent,
      decryptedAt: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route POST pour récupérer le contenu d'un article (compatible avec le frontend)
app.post('/api/articles/:id/content', async (req, res) => {
  try {
    const { id } = req.params;
    const { userAddress } = req.body;
    
    // Vérifier que l'article existe (support _id MongoDB et id numérique)
    let article;
    if (mongoose.Types.ObjectId.isValid(id)) {
      article = await Article.findById(id);
    } else {
      article = await Article.findOne({ id: parseInt(id) });
    }
    
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // Vérifier si l'utilisateur a acheté l'article
    console.log(`🔍 Vérification d'achat pour l'article ${id} par l'utilisateur ${userAddress}`);
    
    let hasAccess = false;
    try {
      const purchase = await Purchase.findOne({
        articleId: article._id.toString(),
        userAddress: userAddress.toLowerCase() // Conversion en minuscules ici aussi !
      });
      
      hasAccess = !!purchase;
      console.log(`📝 Résultat de vérification: ${hasAccess ? 'Accès autorisé' : 'Accès refusé'}`);
      
      if (purchase) {
        console.log(`💰 Achat trouvé: ${purchase.transactionHash} le ${purchase.purchaseDate}`);
      }
    } catch (error) {
      console.error('❌ Erreur lors de la vérification d\'achat:', error);
      hasAccess = false;
    }
    
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied. Please purchase this article first.' });
    }

    if (!article.encryptedContent || !article.encryptionKey) {
      return res.status(404).json({ error: 'No encrypted content available for this article' });
    }

    // Déchiffrer le contenu
    const decryptedContent = decryptContent(article.encryptedContent, article.encryptionKey);
    
    if (!decryptedContent) {
      return res.status(500).json({ error: 'Failed to decrypt content' });
    }

    res.json({
      content: decryptedContent,
      encryptedContent: article.encryptedContent
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 💰 ROUTES PURCHASES

// Enregistrer un achat
app.post('/api/purchases', async (req, res) => {
  try {
    const { articleId, userAddress, transactionHash, price } = req.body;
    
    console.log('📝 Recording purchase:', { articleId, userAddress, transactionHash, price });
    
    // Vérifier que tous les champs requis sont présents
    if (!articleId || !userAddress || !transactionHash || !price) {
      return res.status(400).json({ 
        success: false,
        error: 'Missing required fields: articleId, userAddress, transactionHash, price' 
      });
    }
    
    // Créer l'enregistrement d'achat
    const purchase = new Purchase({
      articleId,
      userAddress: userAddress.toLowerCase(),
      transactionHash,
      price
    });
    
    await purchase.save();
    
    console.log('✅ Purchase recorded successfully');
    res.status(201).json({ 
      success: true, 
      message: 'Purchase recorded successfully',
      purchase: purchase
    });
  } catch (error) {
    console.error('❌ Error recording purchase:', error);
    
    if (error.code === 11000) {
      // Erreur de duplicata
      return res.status(409).json({ 
        success: false,
        error: 'Purchase already recorded' 
      });
    }
    
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Obtenir les achats d'un utilisateur
app.get('/api/purchases/:userAddress', async (req, res) => {
  try {
    const { userAddress } = req.params;
    
    console.log('🔍 Getting purchases for user:', userAddress);
    
    const purchases = await Purchase.find({ 
      userAddress: userAddress.toLowerCase() 
    }).sort({ purchaseDate: -1 });
    
    // Retourner seulement les IDs des articles achetés
    const articleIds = purchases.map(purchase => purchase.articleId);
    
    console.log('📚 Found purchases:', articleIds);
    res.json(articleIds);
  } catch (error) {
    console.error('❌ Error getting purchases:', error);
    res.status(500).json({ error: error.message });
  }
});

// Vérifier si un utilisateur a acheté un article
app.post('/api/purchases/verify', async (req, res) => {
  try {
    const { articleId, userAddress } = req.body;
    
    console.log('🔍 Verifying purchase:', { articleId, userAddress });
    
    const purchase = await Purchase.findOne({
      articleId,
      userAddress: userAddress.toLowerCase()
    });
    
    const isPurchased = !!purchase;
    
    console.log('📝 Purchase verification result:', isPurchased);
    res.json({ isPurchased });
  } catch (error) {
    console.error('❌ Error verifying purchase:', error);
    res.status(500).json({ error: error.message });
  }
});

// 💰 ROUTES BLOCKCHAIN

// Obtenir les adresses des contrats
app.get('/api/contracts', (req, res) => {
  res.json({
    tokenAddress: blockchainService.tokenAddress,
    purchaseAddress: blockchainService.purchaseAddress
  });
});

// Vérifier l'accès à un article
app.get('/api/access/:articleId/:userAddress', async (req, res) => {
  try {
    const { articleId, userAddress } = req.params;
    
    if (!blockchainService.purchaseContract) {
      return res.status(500).json({ error: 'Blockchain service not initialized' });
    }
    
    const hasAccess = await blockchainService.checkAccess(userAddress, articleId);
    res.json({ hasAccess });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtenir le solde de tokens d'un utilisateur
app.get('/api/balance/:address', async (req, res) => {
  try {
    const balance = await blockchainService.getTokenBalance(req.params.address);
    res.json({ balance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test simple de MongoDB
app.get('/api/test-mongo', async (req, res) => {
  try {
    console.log('🔍 Testing MongoDB connection...');
    const isConnected = mongoose.connection.readyState === 1;
    console.log('MongoDB connected:', isConnected);
    
    if (isConnected) {
      const count = await Article.countDocuments();
      console.log('Article count:', count);
      res.json({ 
        status: 'OK', 
        connected: true, 
        articleCount: count 
      });
    } else {
      res.json({ 
        status: 'ERROR', 
        connected: false, 
        message: 'MongoDB not connected' 
      });
    }
  } catch (error) {
    console.error('Test MongoDB error:', error);
    res.status(500).json({ 
      status: 'ERROR', 
      error: error.message 
    });
  }
});

// 🏠 ROUTE PRINCIPALE
app.get('/', (req, res) => {
  res.json({
    message: '🚀 ArticlePulse API Server',
    version: '1.0.0',
    endpoints: [
      'GET /api/articles',
      'GET /api/articles/:id',
      'POST /api/articles',
      'GET /api/access/:articleId/:userAddress',
      'GET /api/contracts',
      'GET /api/balance/:address'
    ]
  });
});

// Démarrage du serveur
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🌐 Server listening on port ${PORT}`);
  console.log(`📱 API available at http://localhost:${PORT}`);
});

module.exports = app;
