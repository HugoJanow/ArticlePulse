// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract ArticlePurchase {
    IERC20 public token;
    address public owner;
    uint256 private articleCounter;

    struct Article {
        string title;
        uint256 price;
        string content;
        bool isActive;
    }

    mapping(uint256 => Article) public articles;
    mapping(uint256 => string) private articleKeys;
    mapping(address => mapping(uint256 => bool)) public hasAccess;

    event ArticlePurchased(address indexed buyer, uint256 indexed articleId, uint256 price);
    event ArticleAdded(uint256 indexed articleId, string title, uint256 price);

    constructor(IERC20 _token) {
        token = _token;
        owner = msg.sender;
        articleCounter = 0;
    }

    function addArticle(string calldata title, uint256 price, string calldata content) external {
        require(msg.sender == owner, "only owner");
        
        articleCounter++;
        articles[articleCounter] = Article({
            title: title,
            price: price,
            content: content,
            isActive: true
        });

        emit ArticleAdded(articleCounter, title, price);
    }

    function getArticle(uint256 articleId) external view returns (string memory title, uint256 price, string memory content, bool isActive) {
        Article memory article = articles[articleId];
        return (article.title, article.price, article.content, article.isActive);
    }

    function getArticleCount() external view returns (uint256) {
        return articleCounter;
    }

    function setArticleKey(uint256 articleId, string calldata encryptedKey) external {
        require(msg.sender == owner, "only owner");
        articleKeys[articleId] = encryptedKey;
    }

    function buyArticle(uint256 articleId) external {
        require(articles[articleId].isActive, "article not active");
        require(!hasAccess[msg.sender][articleId], "already purchased");
        
        uint256 price = articles[articleId].price;
        require(token.transferFrom(msg.sender, owner, price), "payment failed");
        
        hasAccess[msg.sender][articleId] = true;
        emit ArticlePurchased(msg.sender, articleId, price);
    }

    function getArticleKey(uint256 articleId) external view returns (string memory) {
        require(hasAccess[msg.sender][articleId], "access denied");
        return articleKeys[articleId];
    }
}
