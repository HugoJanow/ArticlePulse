const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: String, // En wei (BigNumber as string)
    required: true
  },
  encryptedContent: {
    type: String,
    required: true
  },
  encryptionKey: {
    type: String,
    required: true // Clé AES chiffrée stockée dans le smart contract
  },
  author: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  ipfsHash: {
    type: String,
    default: null // Optionnel: pour stocker sur IPFS
  }
});

module.exports = mongoose.model('Article', articleSchema);
