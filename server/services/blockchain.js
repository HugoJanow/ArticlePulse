const { ethers } = require('ethers');
require('dotenv').config();

const TokenABI = require('../../artifacts/contracts/Token.sol/Token.json').abi;
const ArticlePurchaseABI = require('../../artifacts/contracts/ArticlePurchase.sol/ArticlePurchase.json').abi;

class BlockchainService {
  constructor() {
    this.provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_URL);
    let privateKey = process.env.PRIVATE_KEY;
    if (privateKey && !privateKey.startsWith('0x')) {
      privateKey = '0x' + privateKey;
    }
    if (privateKey) {
      this.wallet = new ethers.Wallet(privateKey, this.provider);
    }
    this.tokenAddress = process.env.TOKEN_CONTRACT_ADDRESS;
    this.purchaseAddress = process.env.PURCHASE_CONTRACT_ADDRESS;
    if (this.tokenAddress && this.purchaseAddress && this.wallet) {
      this.tokenContract = new ethers.Contract(this.tokenAddress, TokenABI, this.wallet);
      this.purchaseContract = new ethers.Contract(this.purchaseAddress, ArticlePurchaseABI, this.wallet);
    }
  }
  initializeContracts(tokenAddress, purchaseAddress) {
    this.tokenAddress = tokenAddress;
    this.purchaseAddress = purchaseAddress;
    this.tokenContract = new ethers.Contract(tokenAddress, TokenABI, this.wallet);
    this.purchaseContract = new ethers.Contract(purchaseAddress, ArticlePurchaseABI, this.wallet);
  }
  async setArticleKey(articleId, encryptedKey) {
    try {
      const tx = await this.purchaseContract.setArticleKey(articleId, encryptedKey);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      throw new Error(`Failed to set article key: ${error.message}`);
    }
  }
  async checkAccess(userAddress, articleId) {
    try {
      return await this.purchaseContract.hasAccess(userAddress, articleId);
    } catch (error) {
      throw new Error(`Failed to check access: ${error.message}`);
    }
  }
  async getArticleKey(articleId, userAddress) {
    try {
      const userContract = new ethers.Contract(
        this.purchaseAddress, 
        ArticlePurchaseABI, 
        new ethers.Wallet(process.env.PRIVATE_KEY, this.provider)
      );
      return await userContract.getArticleKey(articleId);
    } catch (error) {
      throw new Error(`Failed to get article key: ${error.message}`);
    }
  }
  async getTokenBalance(userAddress) {
    try {
      const balance = await this.tokenContract.balanceOf(userAddress);
      return ethers.formatEther(balance);
    } catch (error) {
      throw new Error(`Failed to get token balance: ${error.message}`);
    }
  }
  async transferTokens(toAddress, amount) {
    try {
      const amountWei = ethers.parseEther(amount.toString());
      const tx = await this.tokenContract.transfer(toAddress, amountWei);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      throw new Error(`Failed to transfer tokens: ${error.message}`);
    }
  }
}

module.exports = new BlockchainService();
