// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract ArticlePurchase {
    IERC20 public token;
    address public owner;

    mapping(uint256 => string) private articleKeys;
    mapping(address => mapping(uint256 => bool)) public hasAccess;

    constructor(IERC20 _token) {
        token = _token;
        owner = msg.sender;
    }

    function setArticleKey(uint256 articleId, string calldata encryptedKey) external {
        require(msg.sender == owner, "only owner");
        articleKeys[articleId] = encryptedKey;
    }

    function buyArticle(uint256 articleId, uint256 price) external {
        require(token.transferFrom(msg.sender, owner, price), "payment failed");
        hasAccess[msg.sender][articleId] = true;
    }

    function getArticleKey(uint256 articleId) external view returns (string memory) {
        require(hasAccess[msg.sender][articleId], "access denied");
        return articleKeys[articleId];
    }
}
