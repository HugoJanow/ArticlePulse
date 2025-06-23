// Configuration for the ArticlePulse application
const config = {
  // API configuration
  API_BASE_URL: 'http://localhost:3001/api',
  
  // Blockchain configuration
  BLOCKCHAIN: {
    NETWORK_ID: 31337,
    NETWORK_NAME: 'Hardhat',
    RPC_URL: 'http://localhost:8545',
  },
  
  // Contract addresses - these will be fetched from the API
  CONTRACTS: {
    TOKEN: '',
    ARTICLE_PURCHASE: '',
  },
};

export default config;
