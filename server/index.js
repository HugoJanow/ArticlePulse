const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const crypto = require('crypto');
require('dotenv').config();

// Import des services et modèles
const Article = require('./models/Article');
const Purchase = require('./models/Purchase');
const blockchainService = require('./services/blockchain');

// Fonction pour déchiffrer le contenu
function decryptContent(encryptedContent, encryptionKey) {
  try {
    if (!encryptedContent || !encryptionKey) {
      return null;
    }
    
    const decipher = crypto.createDecipher('aes-256-cbc', encryptionKey);
    let decrypted = decipher.update(encryptedContent, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Error decrypting content:', error);
    return null;
  }
}

const app = express();

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://172.18.85.157:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.use((req, res, next) => {
  if (!req.path.includes('/contracts')) {
    console.log(`📡 ${req.method} ${req.path} - ${new Date().toISOString()}`);
  }
  next();
});

// Connexion MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/articlepulse')
.then(() => {
  console.log('📦 Connected to MongoDB');
}).catch((error) => {
  console.error('❌ MongoDB connection error:', error);
});


app.get('/api/articles', async (req, res) => {
  try {
    const articles = await Article.find({}, '-encryptedContent -encryptionKey');
    res.json(articles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/articles/:id', async (req, res) => {
  try {
    let article;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      article = await Article.findById(req.params.id, '-encryptedContent -encryptionKey');
    }
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

app.post('/api/articles', async (req, res) => {
  try {
    const article = new Article(req.body);
    await article.save();
    res.status(201).json(article);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

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
  
  console.log(' Returning demo articles');
  res.json(demoArticles);
});

app.get('/api/articles/:id/decrypt-test', async (req, res) => {
  try {
    const article = await Article.findOne({ id: req.params.id });
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }
    if (!article.encryptedContent || !article.encryptionKey) {
      return res.status(404).json({ error: 'No encrypted content available for this article' });
    }
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

app.get('/api/content/:id/:userAddress', async (req, res) => {
  try {
    const { id, userAddress } = req.params;
    const article = await Article.findOne({ id: parseInt(id) });
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }
    const hasAccess = true;
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied. Please purchase this article first.' });
    }
    if (!article.encryptedContent || !article.encryptionKey) {
      return res.status(404).json({ error: 'No encrypted content available for this article' });
    }
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

app.post('/api/articles/:id/content', async (req, res) => {
  try {
    const { id } = req.params;
    const { userAddress } = req.body;
    let article;
    if (mongoose.Types.ObjectId.isValid(id)) {
      article = await Article.findById(id);
    } else {
      article = await Article.findOne({ id: parseInt(id) });
    }
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }
    console.log(` Vérification d'achat pour l'article ${id} par l'utilisateur ${userAddress}`);
    let hasAccess = false;
    try {
      console.log(' Chargement de la config des contrats...');
      const contractsConfig = require('./config/contracts.json');
      const { ethers } = require('ethers');
      const provider = new ethers.JsonRpcProvider('http://localhost:8545');
      const ArticlePurchaseABI = require('../artifacts/contracts/ArticlePurchase.sol/ArticlePurchase.json').abi;
      const purchaseContract = new ethers.Contract(
        contractsConfig.articlePurchase,
        ArticlePurchaseABI,
        provider
      );
      const articleId = article.id || parseInt(id);
      hasAccess = await purchaseContract.hasAccess(userAddress, articleId);
      console.log(` Résultat de vérification smart contract: ${hasAccess ? 'Accès autorisé' : 'Accès refusé'}`);
      if (!hasAccess) {
        console.log(' Tentative de vérification via base de données...');
        const purchase = await Purchase.findOne({
          articleId: article._id.toString(),
          userAddress: userAddress.toLowerCase()
        });
        hasAccess = !!purchase;
        console.log(` Résultat de vérification BDD: ${hasAccess ? 'Accès autorisé' : 'Accès refusé'}`);
        if (purchase) {
          console.log(` Achat trouvé en BDD: ${purchase.transactionHash} le ${purchase.purchaseDate}`);
        }
      } else {
        console.log(` Accès confirmé via smart contract pour article ${articleId}`);
      }
    } catch (error) {
      console.error(' Erreur lors de la vérification d\'achat:', error);
      hasAccess = false;
    }
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied. Please purchase this article first.' });
    }
    if (!article.encryptedContent || !article.encryptionKey) {
      return res.status(404).json({ error: 'No encrypted content available for this article' });
    }
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

app.post('/api/purchases', async (req, res) => {
  try {
    const { articleId, userAddress, transactionHash, price } = req.body;
    
    console.log(' Recording purchase:', { articleId, userAddress, transactionHash, price });
    if (!articleId || !userAddress || !transactionHash || !price) {
      return res.status(400).json({ 
        success: false,
        error: 'Missing required fields: articleId, userAddress, transactionHash, price' 
      });
    }
    const purchase = new Purchase({
      articleId,
      userAddress: userAddress.toLowerCase(),
      transactionHash,
      price
    });
    
    await purchase.save();
    
    console.log(' Purchase recorded successfully');
    res.status(201).json({ 
      success: true, 
      message: 'Purchase recorded successfully',
      purchase: purchase
    });
  } catch (error) {
    console.error(' Error recording purchase:', error);
    
    if (error.code === 11000) {
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

app.get('/api/purchases/:userAddress', async (req, res) => {
  try {
    const { userAddress } = req.params;
    
    console.log(' Getting purchases for user:', userAddress);
    
    const purchases = await Purchase.find({ 
      userAddress: userAddress.toLowerCase() 
    }).sort({ purchaseDate: -1 });
    
    const articleIds = purchases.map(purchase => purchase.articleId);
    console.log(' Found purchases:', articleIds);
    res.json(articleIds);
  } catch (error) {
    console.error(' Error getting purchases:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/purchases/verify', async (req, res) => {
  try {
    const { articleId, userAddress } = req.body;
    
    console.log(' Verifying purchase:', { articleId, userAddress });
    
    const purchase = await Purchase.findOne({
      articleId,
      userAddress: userAddress.toLowerCase()
    });
    
    const isPurchased = !!purchase;
    
    console.log(' Purchase verification result:', isPurchased);
    res.json({ isPurchased });
  } catch (error) {
    console.error('❌ Error verifying purchase:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/contracts', (req, res) => {
  const contractsConfig = require('./config/contracts.json');
  res.json({
    tokenAddress: contractsConfig.token,
    purchaseAddress: contractsConfig.articlePurchase
  });
});

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

app.get('/api/balance/:address', async (req, res) => {
  try {
    const balance = await blockchainService.getTokenBalance(req.params.address);
    res.json({ balance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/test-mongo', async (req, res) => {
  try {
    console.log('  Testing MongoDB connection...');
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

app.get('/', (req, res) => {
  res.json({
    message: ' ArticlePulse API Server',
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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(` Server listening on port ${PORT}`);
  console.log(` API available at http://localhost:${PORT}`);
});

module.exports = app;
