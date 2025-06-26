import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardActions, Typography, Button, Box, Chip, Divider } from '@mui/material';
import { ethers } from 'ethers';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import { ArticleService } from '../services/api';

const ArticleCard = ({ article }) => {
  const navigate = useNavigate();
  const { account } = useWeb3();
  const [isPurchased, setIsPurchased] = useState(false);
  const [loading, setLoading] = useState(false);
  const formattedPrice = article?.price 
    ? `${ethers.utils.formatEther(article.price)} APT` 
    : '0 APT';
  useEffect(() => {
    const checkPurchaseStatus = async () => {
      if (account && article) {
        try {
          const status = await ArticleService.verifyPurchase(article._id, account);
          setIsPurchased(status);
        } catch (error) {
          console.error('Error checking purchase status:', error);
          setIsPurchased(false);
        }
      }
    };
    checkPurchaseStatus();
  }, [account, article]);

  const handleViewArticle = () => {
    setLoading(true);
    navigate(`/articles/${article.id}`);
  };
  return (
    <Card 
      elevation={2}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.3s, box-shadow 0.3s',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: 6,
        },
        borderRadius: 2
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
          {article.title}
        </Typography>
        
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
          <Chip 
            label={formattedPrice} 
            color="primary" 
            size="small" 
            sx={{ mr: 1 }} 
          />
          {isPurchased && (
            <Chip 
              label="Purchased" 
              color="success" 
              size="small" 
              variant="outlined" 
            />
          )}
        </Box>
        
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ 
            mb: 2,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {article.description}
        </Typography>
        
        <Divider sx={{ mb: 2 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            By {article.author}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {new Date(article.createdAt).toLocaleDateString()}
          </Typography>
        </Box>
      </CardContent>
      
      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button 
          size="small" 
          variant="contained" 
          color="primary" 
          fullWidth
          onClick={handleViewArticle}
          disabled={loading}
        >
          {loading ? 'Loading...' : isPurchased ? 'Read Article' : 'View Details'}
        </Button>
      </CardActions>
    </Card>
  );
};

export default ArticleCard;
