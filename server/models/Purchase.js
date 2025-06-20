const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
  articleId: {
    type: String,
    required: true
  },
  userAddress: {
    type: String,
    required: true,
    lowercase: true
  },
  transactionHash: {
    type: String,
    required: true,
    unique: true
  },
  price: {
    type: Number,
    required: true
  },
  purchaseDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

purchaseSchema.index({ articleId: 1, userAddress: 1 }, { unique: true });

module.exports = mongoose.model('Purchase', purchaseSchema);
