import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ArticleTest = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const testFetch = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Testing direct API call...');
      
      const response = await axios.get('http://localhost:3001/api/articles');
      console.log('📥 Raw response:', response);
      console.log('📊 Response data:', response.data);
      
      setArticles(response.data);
      console.log('✅ Articles set successfully');
    } catch (error) {
      console.error('❌ Error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testFetch();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Article Test Page</h1>
      
      <button onClick={testFetch} disabled={loading}>
        {loading ? 'Loading...' : 'Reload Articles'}
      </button>
      
      {error && (
        <div style={{ color: 'red', margin: '10px 0' }}>
          Error: {error}
        </div>
      )}
      
      <p>Articles found: {articles.length}</p>
      
      {articles.length > 0 ? (
        <div>
          <h2>Articles:</h2>
          {articles.map((article) => (
            <div key={article._id} style={{ border: '1px solid #ccc', margin: '10px 0', padding: '10px' }}>
              <h3>{article.title}</h3>
              <p>{article.description}</p>
              <p><strong>Author:</strong> {article.author}</p>
              <p><strong>Price:</strong> {article.price}</p>
            </div>
          ))}
        </div>
      ) : (
        !loading && <p>No articles found</p>
      )}
    </div>
  );
};

export default ArticleTest;
