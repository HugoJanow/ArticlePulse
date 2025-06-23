// ArticlePurchase ABI
const ArticlePurchaseABI = [
  // Read functions
  "function token() view returns (address)",
  "function owner() view returns (address)",
  "function articles(uint256) view returns (string title, uint256 price, string content, bool isActive)",
  "function hasAccess(address, uint256) view returns (bool)",
  "function getArticle(uint256 articleId) view returns (string title, uint256 price, string content, bool isActive)",
  "function getArticleCount() view returns (uint256)",
  "function getArticleKey(uint256 articleId) view returns (string)",
  
  // Write functions
  "function addArticle(string calldata title, uint256 price, string calldata content) external",
  "function buyArticle(uint256 articleId) external",
  "function setArticleKey(uint256 articleId, string calldata encryptedKey) external",
  
  // Events
  "event ArticlePurchased(address indexed buyer, uint256 indexed articleId, uint256 price)",
  "event ArticleAdded(uint256 indexed articleId, string title, uint256 price)",
];

export default ArticlePurchaseABI;
