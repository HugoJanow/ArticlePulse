require('dotenv').config();

const config = {
  // Serveur
  PORT: process.env.PORT || 3001,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Base de données
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/articlepulse',
  
  // Blockchain
  ETHEREUM_NETWORK: process.env.ETHEREUM_NETWORK || 'localhost',
  PRIVATE_KEY: process.env.PRIVATE_KEY,
  TOKEN_CONTRACT_ADDRESS: process.env.TOKEN_CONTRACT_ADDRESS,
  PURCHASE_CONTRACT_ADDRESS: process.env.PURCHASE_CONTRACT_ADDRESS,
  
  // Sécurité
  ENCRYPTION_ALGORITHM: 'aes-256-cbc',
  
  // CORS
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS ? 
    process.env.ALLOWED_ORIGINS.split(',') : 
    ['http://localhost:3000'],
  
  // Logs
  LOG_LEVEL: process.env.LOG_LEVEL || 'info'
};

module.exports = config;
