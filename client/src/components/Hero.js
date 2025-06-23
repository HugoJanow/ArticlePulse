import React from 'react';
import { Box, Typography, Button, Container, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const navigate = useNavigate();
  
  return (
    <Paper 
      elevation={0}
      sx={{
        position: 'relative',
        backgroundColor: 'primary.main',
        color: '#fff',
        mb: 4,
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      <Container sx={{ py: 8, position: 'relative', zIndex: 1 }}>
        <Box sx={{ maxWidth: 'md' }}>
          <Typography
            component="h1"
            variant="h2"
            fontWeight="bold"
            gutterBottom
          >
            Welcome to ArticlePulse
          </Typography>
          <Typography
            variant="h5"
            paragraph
            sx={{ mb: 4, maxWidth: 'sm' }}
          >
            A decentralized platform for premium articles powered by blockchain technology.
            Purchase articles with APT tokens and access exclusive content.
          </Typography>
          <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
            <Button 
              variant="contained" 
              color="secondary" 
              size="large"
              onClick={() => navigate('/articles')}
              sx={{ fontWeight: 'bold' }}
            >
              Explore Articles
            </Button>
            <Button 
              variant="outlined" 
              color="inherit" 
              size="large"
              onClick={() => navigate('/profile')}
              sx={{ fontWeight: 'bold', borderColor: 'rgba(255,255,255,0.5)' }}
            >
              My Library
            </Button>
          </Box>
        </Box>
      </Container>
      
      {/* Decorative background elements */}
      <Box 
        sx={{
          position: 'absolute',
          top: -50,
          right: -50,
          width: 300,
          height: 300,
          borderRadius: '50%',
          backgroundColor: 'rgba(255,255,255,0.05)',
        }}
      />
      <Box 
        sx={{
          position: 'absolute',
          bottom: -80,
          left: -80,
          width: 200,
          height: 200,
          borderRadius: '50%',
          backgroundColor: 'rgba(255,255,255,0.05)',
        }}
      />
    </Paper>
  );
};

export default Hero;
