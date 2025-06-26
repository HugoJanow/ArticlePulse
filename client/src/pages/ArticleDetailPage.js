import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Divider, 
  CircularProgress, 
  Alert, 
  Paper, 
  Chip,
  Container
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { useArticle } from '../context/ArticleContext';
import { useWeb3 } from '../context/Web3Context';
import Layout from '../components/Layout';

const ArticleDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    currentArticle, 
    articleContent,
    loading,
    error,
    fetchArticleById,
    fetchArticleContent,
    checkPurchaseStatus
  } = useArticle();
  const { 
    account, 
    balance, 
    purchaseArticle, 
    loading: web3Loading, 
    error: web3Error
  } = useWeb3();
  
  const [isPurchased, setIsPurchased] = useState(false);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [purchaseError, setPurchaseError] = useState(null);
  
  useEffect(() => {
    if (id) {
      fetchArticleById(id);
    }
  }, [id, fetchArticleById]);
  
  // Check if article is purchased
  useEffect(() => {
    const checkPurchase = async () => {
      if (account && currentArticle) {
        console.log('🔍 Checking purchase status for article:', currentArticle);
        console.log('🔍 Using article ID:', currentArticle.id, 'instead of MongoDB _id:', currentArticle._id);
        
        // Use currentArticle.id (numeric) not currentArticle._id (MongoDB string)
        const purchased = await checkPurchaseStatus(currentArticle.id);
        console.log('🔍 Purchase status result:', purchased);
        setIsPurchased(purchased);
        
        // If purchased, fetch content
        if (purchased) {
          console.log('✅ Article already purchased, fetching content...');
          fetchArticleContent(currentArticle._id);
        } else {
          console.log('❌ Article not purchased yet');
        }
      }
    };
    
    checkPurchase();
  }, [account, currentArticle, checkPurchaseStatus, fetchArticleContent]);
  
  // Handle purchase
  const handlePurchase = async () => {
    if (!account) {
      setPurchaseError('Please connect your wallet to purchase this article');
      return;
    }
    
    if (!currentArticle) {
      setPurchaseError('Article not found');
      return;
    }
    
    try {
      setPurchaseLoading(true);
      setPurchaseError(null);
      
      // Debug logs
      console.log('🔍 Purchase Debug Info:');
      console.log('Current Balance:', balance);
      console.log('Article Price (raw):', currentArticle.price);
      console.log('Account:', account);
      
      // Handle price - if it's already in Wei format, use it directly
      let priceInWei;
      if (currentArticle.price.length > 10) {
        // Price is already in Wei (long number string)
        priceInWei = ethers.BigNumber.from(currentArticle.price);
        console.log('Price was in Wei format');
      } else {
        // Price is in Ether format, convert to Wei
        priceInWei = ethers.utils.parseEther(currentArticle.price.toString());
        console.log('Price was in Ether format, converted to Wei');
      }
      
      const balanceInWei = ethers.utils.parseEther(balance || '0');
      const priceInEther = ethers.utils.formatEther(priceInWei);
      
      console.log('Price in Wei:', priceInWei.toString());
      console.log('Price in Ether:', priceInEther);
      console.log('Balance in Wei:', balanceInWei.toString());
      console.log('Balance in Ether:', balance);
      console.log('Has enough balance:', balanceInWei.gte(priceInWei));
      
      // Check if user has enough balance using BigNumber comparison
      if (!balanceInWei.gte(priceInWei)) {
        const errorMsg = `Insufficient APT balance. Required: ${priceInEther} APT, Available: ${balance || '0'} APT`;
        console.error('❌ ' + errorMsg);
        setPurchaseError(errorMsg);
        return;
      }
      
      console.log('✅ Balance check passed, proceeding with purchase...');
      
      // Purchase article
      await purchaseArticle(currentArticle.id, priceInWei);
      
      // Update purchase status
      setIsPurchased(true);
      
      // Fetch content after purchase
      await fetchArticleContent(currentArticle._id);
      
    } catch (error) {
      console.error('Error purchasing article:', error);
      setPurchaseError(error.message || 'Failed to purchase article');
    } finally {
      setPurchaseLoading(false);
    }
  };
  
  if (loading) {
    return (
      <Layout>
        <Container>
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
            <CircularProgress />
          </Box>
        </Container>
      </Layout>
    );
  }
  
  if (error) {
    return (
      <Layout>
        <Container>
          <Alert severity="error" sx={{ my: 4 }}>
            {error}
          </Alert>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => navigate('/articles')}
            sx={{ mt: 2 }}
          >
            Back to Articles
          </Button>
        </Container>
      </Layout>
    );
  }
  
  if (!currentArticle) {
    return (
      <Layout>
        <Container>
          <Alert severity="info" sx={{ my: 4 }}>
            Article not found
          </Alert>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => navigate('/articles')}
            sx={{ mt: 2 }}
          >
            Back to Articles
          </Button>
        </Container>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <Container>
        <Box sx={{ mb: 4 }}>
          <Button 
            variant="text" 
            color="primary" 
            onClick={() => navigate('/articles')}
            sx={{ mb: 2 }}
          >
            ← Back to Articles
          </Button>
          
          <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
            {currentArticle.title}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mr: 2 }}>
              By {currentArticle.author}
            </Typography>
            
            <Typography variant="subtitle2" color="text.secondary" sx={{ mr: 2 }}>
              {new Date(currentArticle.createdAt).toLocaleDateString()}
            </Typography>
            
            <Chip 
              label={`${currentArticle.price?.length > 10 ? 
                ethers.utils.formatEther(currentArticle.price) : 
                currentArticle.price} APT`} 
              color="primary" 
              size="small" 
            />
          </Box>
          
          <Divider sx={{ my: 3 }} />
          
          <Typography variant="body1" paragraph>
            {currentArticle.description}
          </Typography>
          
          {!isPurchased ? (
            <Paper variant="outlined" sx={{ p: 3, my: 4, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                Purchase this article to read the full content
              </Typography>
              
              {!account && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  Please connect your wallet to purchase this article
                </Alert>
              )}
              
              {purchaseError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {purchaseError}
                </Alert>
              )}
              
              {web3Error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {web3Error}
                </Alert>
              )}
              
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  size="large"
                  disabled={!account || purchaseLoading || web3Loading}
                  onClick={handlePurchase}
                  sx={{ mr: 2 }}
                >
                  {purchaseLoading ? <CircularProgress size={24} /> : 'Purchase Article'}
                </Button>
                
                {account && (
                  <Typography variant="body2" color="text.secondary">
                    Your balance: {balance ? `${parseFloat(balance).toFixed(2)} APT` : '0.00 APT'}
                  </Typography>
                )}
              </Box>
            </Paper>
          ) : (
            <Box sx={{ my: 4 }}>
              {articleContent ? (
                <Paper elevation={0} sx={{ p: 3, borderRadius: 2, bgcolor: 'background.paper' }}>
                  <Typography variant="h5" gutterBottom fontWeight="bold">
                    Article Content
                  </Typography>
                  
                  <Divider sx={{ mb: 3 }} />
                  
                  <Box sx={{ typography: 'body1', whiteSpace: 'pre-wrap' }}>
                    {articleContent}
                  </Box>
                </Paper>
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                  <CircularProgress />
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Container>
    </Layout>
  );
};

export default ArticleDetailPage;
