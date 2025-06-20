const express = require('express');
const router = express.Router();
const contractsConfig = require('../config/contracts.json');

// Récupérer les adresses des contrats
router.get('/', (req, res) => {
  try {
    res.json({
      success: true,
      data: contractsConfig
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des contrats:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des adresses des contrats'
    });
  }
});

module.exports = router;
