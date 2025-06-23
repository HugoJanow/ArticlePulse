import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Container, useTheme, useMediaQuery } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';

const WalletButton = () => {
  const { account, balance, connectWallet, disconnectWallet, loading } = useWeb3();
  
  if (loading) {
    return <Button color="inherit" disabled>Connecting...</Button>;
  }
  
  if (account) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Typography variant="body2" sx={{ mr: 2 }}>
          {balance ? `${parseFloat(balance).toFixed(2)} APT` : '0.00 APT'}
        </Typography>
        <Button 
          color="inherit" 
          onClick={disconnectWallet}
          sx={{ 
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '20px',
            padding: '4px 10px',
            fontSize: '0.8rem'
          }}
        >
          {`${account.substring(0, 6)}...${account.substring(account.length - 4)}`}
        </Button>
      </Box>
    );
  }
  
  return (
    <Button 
      color="inherit" 
      onClick={connectWallet}
      sx={{ 
        border: '1px solid rgba(255, 255, 255, 0.3)',
        borderRadius: '20px',
        padding: '6px 16px'
      }}
    >
      Connect Wallet
    </Button>
  );
};

const Header = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <AppBar position="static" color="primary" elevation={0}>
      <Container>
        <Toolbar sx={{ padding: isMobile ? '0.5rem 0' : '0.5rem 0' }}>
          <Typography 
            variant="h6" 
            component={RouterLink} 
            to="/" 
            sx={{ 
              flexGrow: 1, 
              fontWeight: 700,
              color: 'white',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            📰 ArticlePulse
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button color="inherit" component={RouterLink} to="/articles" sx={{ mr: 2 }}>
              Articles
            </Button>
            
            {!isMobile && (
              <Button color="inherit" component={RouterLink} to="/profile" sx={{ mr: 2 }}>
                My Profile
              </Button>
            )}
            
            <WalletButton />
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;
