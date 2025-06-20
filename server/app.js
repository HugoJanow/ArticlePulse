const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// Configuration
const config = require('./config');
const connectDB = require('./config/database');

// Middleware
const { requestLogger, errorLogger } = require('./middleware/logger');

// Routes
const articleRoutes = require('./routes/articles');
const contentRoutes = require('./routes/content');
const contractRoutes = require('./routes/contracts');

// Services
const blockchainService = require('./services/blockchain');

class ArticlePulseServer {
  constructor() {
    this.app = express();
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  /**
   * Initialise les middleware
   */
  initializeMiddleware() {
    // Sécurité
    this.app.use(helmet());
    
    // CORS
    this.app.use(cors({
      origin: config.ALLOWED_ORIGINS,
      credentials: true
    }));
    
    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));
    
    // Logging
    this.app.use(requestLogger);
  }

  /**
   * Initialise les routes
   */
  initializeRoutes() {
    // Route de santé
    this.app.get('/health', (req, res) => {
      res.json({
        success: true,
        message: 'ArticlePulse API is running',
        timestamp: new Date().toISOString(),
        environment: config.NODE_ENV
      });
    });

    // Routes API
    this.app.use('/api/articles', articleRoutes);
    this.app.use('/api/content', contentRoutes);
    this.app.use('/api/contracts', contractRoutes);

    this.app.use('/api/contracts', contractRoutes);

    // Route 404
    this.app.use((req, res) => {
      res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.originalUrl
      });
    });
  }

  /**
   * Initialise la gestion d'erreurs
   */
  initializeErrorHandling() {
    // Logger d'erreurs
    this.app.use(errorLogger);
    
    // Gestionnaire d'erreurs global
    this.app.use((err, req, res, next) => {
      const statusCode = err.statusCode || 500;
      
      res.status(statusCode).json({
        success: false,
        message: err.message || 'Internal Server Error',
        ...(config.NODE_ENV === 'development' && { stack: err.stack })
      });
    });
  }

  /**
   * Démarre le serveur
   */
  async start() {
    try {
      // Connexion à la base de données
      await connectDB();
      
      // Démarrage du serveur
      this.app.listen(config.PORT, () => {
        console.log(`🌐 Server listening on port ${config.PORT}`);
        console.log(`📱 API available at http://localhost:${config.PORT}`);
        console.log(`🔧 Environment: ${config.NODE_ENV}`);
      });
      
    } catch (error) {
      console.error('❌ Failed to start server:', error);
      process.exit(1);
    }
  }
}

// Lancement du serveur
const server = new ArticlePulseServer();
server.start();

module.exports = ArticlePulseServer;
