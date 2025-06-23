import React, { useEffect } from 'react';
import { Box, Typography, Grid, Container, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useArticle } from '../context/ArticleContext';
import Hero from '../components/Hero';
import ArticleCard from '../components/ArticleCard';
import Layout from '../components/Layout';

const HomePage = () => {
  const { articles, loading, error, fetchArticles } = useArticle();
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);
  
  // Get the 3 most recent articles
  const recentArticles = articles.slice(0, 3);
  
  return (
    <Layout>
      <Hero />
      
      <Container>
        <Box sx={{ mb: 6 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" component="h2" fontWeight="bold">
              Recent Articles
            </Typography>
            <Button 
              variant="outlined" 
              color="primary"
              onClick={() => navigate('/articles')}
            >
              View All
            </Button>
          </Box>
          
          {loading ? (
            <Typography variant="body1">Loading articles...</Typography>
          ) : error ? (
            <Typography variant="body1" color="error">{error}</Typography>
          ) : (
            <Grid container spacing={3}>
              {recentArticles.map((article) => (
                <Grid item xs={12} sm={6} md={4} key={article.id}>
                  <ArticleCard article={article} />
                </Grid>
              ))}
              
              {recentArticles.length === 0 && (
                <Box sx={{ width: '100%', py: 4, textAlign: 'center' }}>
                  <Typography variant="body1">No articles available</Typography>
                </Box>
              )}
            </Grid>
          )}
        </Box>
        
        <Box sx={{ py: 6 }}>
          <Typography variant="h4" component="h2" fontWeight="bold" gutterBottom>
            How It Works
          </Typography>
          
          <Grid container spacing={4} sx={{ mt: 2 }}>
            <Grid item xs={12} md={4}>
              <Box sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2, height: '100%' }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  1. Connect Wallet
                </Typography>
                <Typography variant="body1">
                  Connect your Ethereum wallet to access the platform and manage your APT tokens.
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2, height: '100%' }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  2. Purchase Articles
                </Typography>
                <Typography variant="body1">
                  Use APT tokens to purchase access to premium articles. Each transaction is secured by blockchain.
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2, height: '100%' }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  3. Access Content
                </Typography>
                <Typography variant="body1">
                  Once purchased, articles are permanently accessible in your library. Read them anytime.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Layout>
  );
};

export default HomePage;
