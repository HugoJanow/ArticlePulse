import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, TextField, InputAdornment, Divider, CircularProgress, Pagination, Container } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useArticle } from '../context/ArticleContext';
import ArticleCard from '../components/ArticleCard';
import Layout from '../components/Layout';

const ArticleListPage = () => {
  const { articles, loading, error, fetchArticles } = useArticle();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredArticles, setFilteredArticles] = useState([]);
  
  const itemsPerPage = 6;
  
  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);
  
  useEffect(() => {
    if (articles.length > 0) {
      // Filter articles based on search query
      const filtered = articles.filter(
        article => 
          article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
          article.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          article.author.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      setFilteredArticles(filtered);
      setCurrentPage(1); // Reset to first page when search changes
    }
  }, [articles, searchQuery]);
  
  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredArticles.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredArticles.length / itemsPerPage);
  
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  return (
    <Layout>
      <Container>
        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
          Articles
        </Typography>
        
        <Box sx={{ mb: 4 }}>
          <TextField
            fullWidth
            placeholder="Search articles by title, description, or author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />
          
          <Typography variant="body2" color="text.secondary">
            {filteredArticles.length} {filteredArticles.length === 1 ? 'article' : 'articles'} found
          </Typography>
        </Box>
        
        <Divider sx={{ mb: 4 }} />
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ my: 4, p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
            <Typography variant="body1" color="error">
              {error}
            </Typography>
          </Box>
        ) : filteredArticles.length === 0 ? (
          <Box sx={{ my: 4, textAlign: 'center' }}>
            <Typography variant="h6">
              No articles found matching your search criteria
            </Typography>
          </Box>
        ) : (
          <>
            <Grid container spacing={3}>
              {currentItems.map((article) => (
                <Grid item xs={12} sm={6} md={4} key={article.id}>
                  <ArticleCard article={article} />
                </Grid>
              ))}
            </Grid>
            
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <Pagination 
                  count={totalPages} 
                  page={currentPage} 
                  onChange={handlePageChange} 
                  color="primary" 
                  size="large"
                />
              </Box>
            )}
          </>
        )}
      </Container>
    </Layout>
  );
};

export default ArticleListPage;
