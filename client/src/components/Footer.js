import React from 'react';
import { Box, Container, Typography, Link, Divider } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Footer = () => {
  return (
    <Box 
      component="footer" 
      sx={{ 
        mt: 'auto',
        py: 3,
        backgroundColor: (theme) => theme.palette.grey[100]
      }}
    >
      <Divider />
      <Container maxWidth="lg" sx={{ pt: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ mb: { xs: 2, md: 0 } }}>
            <Typography variant="h6" component={RouterLink} to="/" color="textPrimary" sx={{ textDecoration: 'none', fontWeight: 'bold' }}>
              📰 ArticlePulse
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              A decentralized platform for premium content
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant="subtitle1" fontWeight="bold" mb={1}>
              Quick Links
            </Typography>
            <Link component={RouterLink} to="/" color="inherit" sx={{ mb: 0.5 }}>
              Home
            </Link>
            <Link component={RouterLink} to="/articles" color="inherit" sx={{ mb: 0.5 }}>
              Articles
            </Link>
            <Link component={RouterLink} to="/profile" color="inherit" sx={{ mb: 0.5 }}>
              My Profile
            </Link>
          </Box>
          
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant="subtitle1" fontWeight="bold" mb={1}>
              Resources
            </Typography>
            <Link href="https://ethereum.org" target="_blank" color="inherit" sx={{ mb: 0.5 }}>
              Ethereum
            </Link>
            <Link href="https://metamask.io" target="_blank" color="inherit" sx={{ mb: 0.5 }}>
              MetaMask
            </Link>
            <Link href="https://github.com" target="_blank" color="inherit" sx={{ mb: 0.5 }}>
              GitHub
            </Link>
          </Box>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', flexDirection: { xs: 'column', sm: 'row' } }}>
          <Typography variant="body2" color="textSecondary">
            © {new Date().getFullYear()} ArticlePulse. All rights reserved.
          </Typography>
          <Box>
            <Typography variant="body2" color="textSecondary" component="span">
              Built with ❤️ for decentralized publishing
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
