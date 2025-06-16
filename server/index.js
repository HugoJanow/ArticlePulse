const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const articles = [
  { id: 1, title: 'Premier article' },
  { id: 2, title: 'Deuxième article' },
  { id: 3, title: 'Troisième article' }
];

app.get('/articles', (req, res) => {
  res.json(articles);
});

app.get('/key/:id/:address', (req, res) => {
  const { id, address } = req.params;
  res.json({ id: Number(id), address, key: `fake-key-for-${id}-${address}` });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
