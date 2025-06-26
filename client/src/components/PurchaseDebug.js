import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { ethers } from 'ethers';

const PurchaseDebug = () => {
  const { 
    account, 
    balance, 
    tokenContract, 
    articlePurchaseContract, 
    signer, 
    provider,
    connectWallet 
  } = useWeb3();
  
  const [debugInfo, setDebugInfo] = useState({});
  const [testResults, setTestResults] = useState({});

  // Fonction pour diagnostiquer la configuration
  const diagnoseSetup = async () => {
    const results = {};
    
    try {
      // 1. Vérifier la connexion wallet
      results.walletConnected = !!account;
      results.walletAddress = account;
      
      // 2. Vérifier le réseau
      if (provider) {
        const network = await provider.getNetwork();
        results.networkId = network.chainId;
        results.networkName = network.name;
        results.isLocalNetwork = network.chainId === 31337;
      }
      
      // 3. Vérifier les contrats
      results.tokenContractExists = !!tokenContract;
      results.purchaseContractExists = !!articlePurchaseContract;
      
      if (tokenContract) {
        results.tokenContractAddress = tokenContract.address;
        
        // Vérifier le solde directement depuis le contrat
        if (account) {
          const contractBalance = await tokenContract.balanceOf(account);
          results.contractBalance = ethers.utils.formatEther(contractBalance);
          results.balanceFromContext = balance;
          results.balanceMatch = results.contractBalance === balance;
        }
        
        // Vérifier les informations du token
        const tokenName = await tokenContract.name();
        const tokenSymbol = await tokenContract.symbol();
        results.tokenName = tokenName;
        results.tokenSymbol = tokenSymbol;
      }
      
      if (articlePurchaseContract) {
        results.purchaseContractAddress = articlePurchaseContract.address;
        
        // Vérifier l'adresse du token dans le contrat de purchase
        const tokenAddressInPurchase = await articlePurchaseContract.token();
        results.tokenAddressInPurchase = tokenAddressInPurchase;
        results.tokenAddressMatch = tokenAddressInPurchase?.toLowerCase() === tokenContract?.address?.toLowerCase();
      }
      
      // 4. Vérifier les adresses connues avec des tokens
      const knownAddresses = [
        '0xbDA5747bFD65F08deb54cb465eB87D40e51B197E',
        '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', // Premier compte Hardhat
        '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'  // Deuxième compte Hardhat
      ];
      
      results.knownBalances = {};
      if (tokenContract) {
        for (const addr of knownAddresses) {
          try {
            const bal = await tokenContract.balanceOf(addr);
            results.knownBalances[addr] = ethers.utils.formatEther(bal);
          } catch (e) {
            results.knownBalances[addr] = 'Error: ' + e.message;
          }
        }
      }
      
    } catch (error) {
      results.error = error.message;
    }
    
    setDebugInfo(results);
  };

  // Test d'approbation et d'achat
  const testPurchaseFlow = async () => {
    if (!tokenContract || !articlePurchaseContract || !account) {
      alert('Wallet ou contrats non connectés');
      return;
    }
    
    const results = {};
    
    try {
      // Test avec un montant de 1 APT
      const testAmount = ethers.utils.parseEther('1');
      
      // 1. Vérifier le solde
      const currentBalance = await tokenContract.balanceOf(account);
      results.currentBalance = ethers.utils.formatEther(currentBalance);
      results.hasEnoughBalance = currentBalance.gte(testAmount);
      
      if (!results.hasEnoughBalance) {
        results.error = 'Solde insuffisant pour le test';
        setTestResults(results);
        return;
      }
      
      // 2. Vérifier l'allowance actuelle
      const currentAllowance = await tokenContract.allowance(account, articlePurchaseContract.address);
      results.currentAllowance = ethers.utils.formatEther(currentAllowance);
      
      // 3. Test d'approbation
      console.log('🔄 Test d\'approbation...');
      const approveTx = await tokenContract.approve(articlePurchaseContract.address, testAmount);
      results.approveTxHash = approveTx.hash;
      
      const approveReceipt = await approveTx.wait();
      results.approveSuccess = approveReceipt.status === 1;
      
      // 4. Vérifier la nouvelle allowance
      const newAllowance = await tokenContract.allowance(account, articlePurchaseContract.address);
      results.newAllowance = ethers.utils.formatEther(newAllowance);
      
      results.testSuccess = true;
      
    } catch (error) {
      results.error = error.message;
      results.testSuccess = false;
    }
    
    setTestResults(results);
  };

  // Mint des tokens vers l'adresse connectée
  const mintToCurrentAccount = async () => {
    if (!account) {
      alert('Aucun wallet connecté');
      return;
    }
    
    try {
      // Utiliser le script de mint
      const mintAmount = '1000';
      console.log(`🪙 Minting ${mintAmount} AZPT to ${account}...`);
      
      // Cette partie nécessiterait d'appeler le backend ou d'avoir les droits de mint
      alert(`Pour minter des tokens vers ${account}, exécutez:\nnpx hardhat run scripts/mint-user-tokens.js --network localhost\n\nEt modifiez l'adresse userAddress dans le script.`);
      
    } catch (error) {
      console.error('Erreur mint:', error);
    }
  };

  useEffect(() => {
    if (account && tokenContract) {
      diagnoseSetup();
    }
  }, [account, tokenContract, articlePurchaseContract]);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', maxWidth: '1200px' }}>
      <h1>🔍 Diagnostic d'Achat d'Articles</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>🔧 Actions</h2>
        <button onClick={connectWallet} style={{ marginRight: '10px' }}>
          Connecter Wallet
        </button>
        <button onClick={diagnoseSetup} style={{ marginRight: '10px' }}>
          Diagnostiquer
        </button>
        <button onClick={testPurchaseFlow} style={{ marginRight: '10px' }}>
          Test Approbation
        </button>
        <button onClick={mintToCurrentAccount}>
          Mint vers compte actuel
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Informations de diagnostic */}
        <div style={{ border: '1px solid #ccc', padding: '15px' }}>
          <h3>📊 Diagnostic</h3>
          
          {!account ? (
            <div style={{ color: 'red' }}>❌ Aucun wallet connecté</div>
          ) : (
            <div>
              <div style={{ marginBottom: '10px' }}>
                <strong>Wallet:</strong> {debugInfo.walletAddress ? 
                  `${debugInfo.walletAddress.slice(0, 6)}...${debugInfo.walletAddress.slice(-4)}` : 
                  'Non connecté'
                }
              </div>
              
              <div style={{ marginBottom: '10px' }}>
                <strong>Réseau:</strong> {debugInfo.networkId} ({debugInfo.isLocalNetwork ? '✅ Local Hardhat' : '❌ Pas local'})
              </div>
              
              <div style={{ marginBottom: '10px' }}>
                <strong>Token Contract:</strong> {debugInfo.tokenContractExists ? '✅' : '❌'}
                {debugInfo.tokenContractAddress && (
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {debugInfo.tokenContractAddress}
                  </div>
                )}
              </div>
              
              <div style={{ marginBottom: '10px' }}>
                <strong>Purchase Contract:</strong> {debugInfo.purchaseContractExists ? '✅' : '❌'}
                {debugInfo.purchaseContractAddress && (
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {debugInfo.purchaseContractAddress}
                  </div>
                )}
              </div>
              
              <div style={{ marginBottom: '10px' }}>
                <strong>Solde (Contrat):</strong> {debugInfo.contractBalance || 'N/A'} APT
              </div>
              
              <div style={{ marginBottom: '10px' }}>
                <strong>Solde (Contexte):</strong> {debugInfo.balanceFromContext || 'N/A'} APT
              </div>
              
              <div style={{ marginBottom: '10px' }}>
                <strong>Soldes match:</strong> {debugInfo.balanceMatch ? '✅' : '❌'}
              </div>
              
              <div style={{ marginBottom: '10px' }}>
                <strong>Token:</strong> {debugInfo.tokenName} ({debugInfo.tokenSymbol})
              </div>
              
              <div style={{ marginBottom: '10px' }}>
                <strong>Adresses contrats match:</strong> {debugInfo.tokenAddressMatch ? '✅' : '❌'}
              </div>
            </div>
          )}
          
          {debugInfo.error && (
            <div style={{ color: 'red', marginTop: '10px' }}>
              ❌ Erreur: {debugInfo.error}
            </div>
          )}
        </div>

        {/* Résultats des tests */}
        <div style={{ border: '1px solid #ccc', padding: '15px' }}>
          <h3>🧪 Tests d'Achat</h3>
          
          {Object.keys(testResults).length === 0 ? (
            <div>Cliquez sur "Test Approbation" pour tester</div>
          ) : (
            <div>
              <div style={{ marginBottom: '10px' }}>
                <strong>Solde actuel:</strong> {testResults.currentBalance} APT
              </div>
              
              <div style={{ marginBottom: '10px' }}>
                <strong>Solde suffisant:</strong> {testResults.hasEnoughBalance ? '✅' : '❌'}
              </div>
              
              {testResults.currentAllowance && (
                <div style={{ marginBottom: '10px' }}>
                  <strong>Allowance avant:</strong> {testResults.currentAllowance} APT
                </div>
              )}
              
              {testResults.approveTxHash && (
                <div style={{ marginBottom: '10px' }}>
                  <strong>TX Approbation:</strong> 
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {testResults.approveTxHash}
                  </div>
                </div>
              )}
              
              {testResults.newAllowance && (
                <div style={{ marginBottom: '10px' }}>
                  <strong>Allowance après:</strong> {testResults.newAllowance} APT
                </div>
              )}
              
              <div style={{ marginBottom: '10px' }}>
                <strong>Test réussi:</strong> {testResults.testSuccess ? '✅' : '❌'}
              </div>
              
              {testResults.error && (
                <div style={{ color: 'red', marginTop: '10px' }}>
                  ❌ Erreur: {testResults.error}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Soldes des adresses connues */}
      {debugInfo.knownBalances && (
        <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '15px' }}>
          <h3>💰 Soldes des Adresses Connues</h3>
          {Object.entries(debugInfo.knownBalances).map(([address, balance]) => (
            <div key={address} style={{ marginBottom: '5px' }}>
              <strong>{address.slice(0, 6)}...{address.slice(-4)}:</strong> {balance} APT
              {account?.toLowerCase() === address.toLowerCase() && (
                <span style={{ color: 'green' }}> ← Vous</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PurchaseDebug;
