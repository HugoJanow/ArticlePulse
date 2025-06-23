import React, { useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Divider, 
  Button, 
  Alert,
  CircularProgress,
  Container
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import { useArticle } from '../context/ArticleContext';
import ArticleCard from '../components/ArticleCard';
import Layout from '../components/Layout';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { 
    account, 
    balance, 
    connectWallet, 
    loading: web3Loading 
  } = useWeb3();
  const { 
    articles, 
    purchasedArticles, 
    loading, 
    fetchPurchasedArticles 
  } = useArticle();
  
  // Fetch purchased articles when account changes
  useEffect(() => {
    if (account) {
      fetchPurchasedArticles();
    }
  }, [account, fetchPurchasedArticles]);
  
  // Filter the articles based on purchasedArticles
  const userArticles = articles.filter(article => 
    purchasedArticles.includes(article._id)
  );
  
  if (!account) {
    return (
      <Layout>
        <Container>
          <Paper sx={{ p: 4, my: 4, textAlign: 'center', borderRadius: 2 }}>
            <Typography variant="h5" gutterBottom>
              Connect your wallet to view your profile
            </Typography>
            <Typography variant="body1" paragraph color="text.secondary">
              You need to connect your Ethereum wallet to access your profile and purchased articles.
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              size="large"
              onClick={connectWallet}
              disabled={web3Loading}
              sx={{ mt: 2 }}
            >
              {web3Loading ? <CircularProgress size={24} /> : 'Connect Wallet'}
            </Button>
          </Paper>
        </Container>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <Container>
        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
          My Profile
        </Typography>
        
        <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Wallet Information
          </Typography>
          
          <Divider sx={{ mb: 2 }} />
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Address
              </Typography>
              <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>
                {account}
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                APT Balance
              </Typography>
              <Typography variant="body1">
                {balance ? `${parseFloat(balance).toFixed(2)} APT` : '0.00 APT'}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
        
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h2" gutterBottom fontWeight="bold">
            My Library
          </Typography>
          
          <Typography variant="body1" paragraph color="text.secondary">
            Articles you have purchased
          </Typography>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : userArticles.length === 0 ? (
            <Paper sx={{ p: 4, my: 2, textAlign: 'center', borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                You haven't purchased any articles yet
              </Typography>
              <Typography variant="body1" paragraph color="text.secondary">
                Explore our collection and purchase articles to add them to your library.
              </Typography>
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => navigate('/articles')}
                sx={{ mt: 2 }}
              >
                Explore Articles
              </Button>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {userArticles.map((article) => (
                <Grid item xs={12} sm={6} md={4} key={article.id}>
                  <ArticleCard article={article} />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
        
        <Box sx={{ mt: 6, mb: 4 }}>
          <Alert severity="info">
            <Typography variant="body1">
              Need more APT tokens? Contact the platform administrator to add tokens to your wallet.
            </Typography>
          </Alert>
        </Box>
      </Container>
    </Layout>
  );
};

export default ProfilePage;
