require('dotenv').config();
const mongoose = require('mongoose');
const Purchase = require('../models/Purchase');

async function resetPurchases() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/articlepulse');
    console.log(' Connecté à MongoDB');
    const purchaseCount = await Purchase.countDocuments();
    console.log(` Nombre d'achats actuels: ${purchaseCount}`);
    if (purchaseCount === 0) {
      console.log(' Aucun achat à supprimer');
    } else {
      const result = await Purchase.deleteMany({});
      console.log(`  ${result.deletedCount} achats supprimés`);
      console.log(' Tous les achats ont été reset avec succès');
    }
  } catch (error) {
    console.error(' Erreur lors du reset des achats:', error);
  } finally {
    await mongoose.disconnect();
    console.log(' Connexion fermée');
  }
}

// Exécuter le script
resetPurchases();
