import React, { createContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { ethers } from 'ethers';
import Web3Modal from 'web3modal';
import config from '../config';
import { BlockchainService } from '../services/api';

// ABIs
import TokenABI from '../contracts/TokenABI';
import ArticlePurchaseABI from '../contracts/ArticlePurchaseABI';

// Context
export const Web3Context = createContext();

// Provider Component
export const Web3Provider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [network, setNetwork] = useState(null);
  const [balance, setBalance] = useState(null);
  const [tokenContract, setTokenContract] = useState(null);
  const [articlePurchaseContract, setArticlePurchaseContract] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cache pour éviter les appels répétés
  const contractAddressesCache = useRef(null);
  const balanceCache = useRef({});

  // Initialize web3modal - wrapped in useMemo to prevent recreation on each render
  const web3Modal = useMemo(() => new Web3Modal({
    cacheProvider: true,
    providerOptions: {},
  }), []);

  // Disconnect wallet - defined early so it can be used in dependencies
  const disconnectWallet = useCallback(async () => {
    try {
      await web3Modal.clearCachedProvider();
      setProvider(null);
      setSigner(null);
      setAccount(null);
      setNetwork(null);
      setBalance(null);
      setTokenContract(null);
      setArticlePurchaseContract(null);
      contractAddressesCache.current = null;
      balanceCache.current = {};
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  }, [web3Modal]);

  // Get contract addresses with caching
  const getContractAddresses = useCallback(async () => {
    if (contractAddressesCache.current) {
      return contractAddressesCache.current;
    }
    
    try {
      const addresses = await BlockchainService.getContractAddresses();
      contractAddressesCache.current = addresses;
      return addresses;
    } catch (error) {
      console.error('Failed to fetch contract addresses:', error);
      throw error;
    }
  }, []);

  // Update token balance with caching
  const updateBalance = useCallback(async (address) => {
    if (!address) return;
    
    const cacheKey = `${address}_${tokenContract?.address || 'no-contract'}`;
    const now = Date.now();
    
    // Use cache if less than 10 seconds old
    if (balanceCache.current[cacheKey] && 
        now - balanceCache.current[cacheKey].timestamp < 10000) {
      setBalance(balanceCache.current[cacheKey].balance);
      return;
    }
    
    try {
      let balanceValue;
      
      if (tokenContract) {
        const balance = await tokenContract.balanceOf(address);
        balanceValue = ethers.formatEther(balance);
      } else {
        balanceValue = await BlockchainService.getBalance(address);
      }
      
      // Cache the result
      balanceCache.current[cacheKey] = {
        balance: balanceValue,
        timestamp: now
      };
      
      setBalance(balanceValue);
    } catch (error) {
      console.error('Failed to fetch balance:', error);
    }
  }, [tokenContract]);

  // Initialize contracts
  const initializeContracts = useCallback(async () => {
    if (!signer) return;

    try {
      // Get contract addresses
      const contractAddresses = await getContractAddresses();
      
      // Update config with contract addresses
      config.CONTRACTS.TOKEN = contractAddresses.tokenAddress;
      config.CONTRACTS.ARTICLE_PURCHASE = contractAddresses.purchaseAddress;
      
      // Create contract instances
      const token = new ethers.Contract(config.CONTRACTS.TOKEN, TokenABI, signer);
      const articlePurchase = new ethers.Contract(config.CONTRACTS.ARTICLE_PURCHASE, ArticlePurchaseABI, signer);
      
      setTokenContract(token);
      setArticlePurchaseContract(articlePurchase);
    } catch (error) {
      console.error('Failed to initialize contracts:', error);
      setError('Failed to initialize contracts. Please try again.');
    }
  }, [signer, getContractAddresses]);

  // Connect wallet
  const connectWallet = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const instance = await web3Modal.connect();
      const provider = new ethers.BrowserProvider(instance);
      const signer = await provider.getSigner();
      const account = await signer.getAddress();
      const network = await provider.getNetwork();
      
      setProvider(provider);
      setSigner(signer);
      setAccount(account);
      setNetwork(network);
      
      // Update when user changes accounts
      instance.on('accountsChanged', async (accounts) => {
        if (accounts.length === 0) {
          await disconnectWallet();
        } else {
          setAccount(accounts[0]);
          const signer = await provider.getSigner();
          setSigner(signer);
          // Clear balance cache when account changes
          balanceCache.current = {};
        }
      });
      
      // Update when network changes
      instance.on('chainChanged', () => {
        window.location.reload();
      });
      
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      setError('Failed to connect wallet. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [web3Modal, disconnectWallet]);

  // Initialize contracts when signer changes
  useEffect(() => {
    if (signer) {
      initializeContracts();
    }
  }, [signer, initializeContracts]);

  // Update balance when account or contracts change
  useEffect(() => {
    if (account && tokenContract) {
      updateBalance(account);
    }
  }, [account, tokenContract, updateBalance]);

  // Auto-connect if cached provider exists
  useEffect(() => {
    if (web3Modal.cachedProvider) {
      connectWallet();
    }
  }, [web3Modal, connectWallet]);

  // Purchase article
  const purchaseArticle = async (articleId, price) => {
    if (!signer || !tokenContract || !articlePurchaseContract) {
      throw new Error('Wallet not connected or contracts not initialized');
    }
    
    try {
      setLoading(true);
      
      // Convert price to wei
      const priceInWei = ethers.parseEther(price.toString());
      
      // First approve token transfer
      const approveTx = await tokenContract.approve(articlePurchaseContract.target, priceInWei);
      await approveTx.wait();
      
      // Then purchase the article
      const purchaseTx = await articlePurchaseContract.buyArticle(articleId);
      const receipt = await purchaseTx.wait();
      
      // Clear balance cache to force refresh
      balanceCache.current = {};
      
      // Update balance
      await updateBalance(account);
      
      return receipt;
    } catch (error) {
      console.error('Purchase failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    provider,
    signer,
    account,
    network,
    balance,
    tokenContract,
    articlePurchaseContract,
    loading,
    error,
    connectWallet,
    disconnectWallet,
    updateBalance,
    purchaseArticle,
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
};

export default Web3Context;
