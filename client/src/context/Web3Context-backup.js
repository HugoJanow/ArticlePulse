import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
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
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  }, [web3Modal]);

  // Update token balance - defined early so it can be used in dependencies
  const updateBalance = useCallback(async (address) => {
    if (!address) return;
    
    try {
      if (tokenContract) {
        const balance = await tokenContract.balanceOf(address);
        setBalance(ethers.formatEther(balance));
      } else {
        // Fallback to API if contract not initialized
        const balance = await BlockchainService.getBalance(address);
        setBalance(balance);
      }
    } catch (error) {
      console.error('Failed to fetch balance:', error);
    }
  }, [tokenContract]);

  // Initialize contracts
  const initializeContracts = useCallback(async () => {
    if (!signer) return;

    try {
      // Get contract addresses from the API
      const contractAddresses = await BlockchainService.getContractAddresses();
      
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
  }, [signer]);

  // Connect wallet
  const connectWallet = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const instance = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(instance);
      const signer = provider.getSigner();
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
          const signer = provider.getSigner();
          setSigner(signer);
          initializeContracts();
        }
      });
      
      // Update when network changes
      instance.on('chainChanged', () => {
        window.location.reload();
      });
      
      await initializeContracts();
      await updateBalance(account);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      setError('Failed to connect wallet. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [web3Modal, initializeContracts, disconnectWallet, updateBalance]);

  // Purchase article
  const purchaseArticle = async (articleId, price) => {
    if (!signer || !tokenContract || !articlePurchaseContract) {
      throw new Error('Wallet not connected or contracts not initialized');
    }
    
    try {
      setLoading(true);
      // First approve token transfer
      const approveTx = await tokenContract.approve(articlePurchaseContract.address, price);
      await approveTx.wait();
      
      // Then purchase the article
      const purchaseTx = await articlePurchaseContract.buyArticle(articleId);
      const receipt = await purchaseTx.wait();
      
      // Record purchase in backend
      await BlockchainService.recordPurchase({
        articleId,
        userAddress: account,
        transactionHash: purchaseTx.hash,
        price: ethers.utils.formatEther(price),
      });
      
      // Update balance
      await updateBalance(account);
      
      return receipt;
    } catch (error) {
      console.error('Failed to purchase article:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Check if connected to correct network
  const checkNetwork = useCallback(async () => {
    if (!provider) return false;
    
    const network = await provider.getNetwork();
    return network.chainId === config.BLOCKCHAIN.NETWORK_ID;
  }, [provider]);

  // Auto connect if provider is cached
  useEffect(() => {
    if (web3Modal.cachedProvider) {
      connectWallet();
    }
  }, [connectWallet, web3Modal.cachedProvider]);

  return (
    <Web3Context.Provider
      value={{
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
        purchaseArticle,
        updateBalance,
        checkNetwork,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

// Custom hook to use the Web3 context
export const useWeb3 = () => {
  const context = React.useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};