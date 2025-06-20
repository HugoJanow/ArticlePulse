const fs = require("fs");
const path = require("path");

/**
 * Récupère les adresses des contrats depuis le fichier de configuration
 */
function getContractAddresses() {
  const contractsConfigPath = path.join(__dirname, "..", "config", "contracts.json");
  
  if (!fs.existsSync(contractsConfigPath)) {
    throw new Error("Fichier de configuration des contrats non trouvé. Veuillez déployer les contrats d'abord.");
  }
  
  const config = JSON.parse(fs.readFileSync(contractsConfigPath, "utf8"));
  
  return {
    tokenAddress: config.tokenAddress,
    purchaseAddress: config.purchaseAddress,
    deployedAt: config.deployedAt,
    network: config.network,
    chainId: config.chainId
  };
}

/**
 * Affiche les adresses des contrats
 */
function displayContractAddresses() {
  try {
    const addresses = getContractAddresses();
    
    console.log(" Adresses des contrats déployés:");
    console.log("=====================================");
    console.log(" Token (APT):", addresses.tokenAddress);
    console.log(" ArticlePurchase:", addresses.purchaseAddress);
    console.log(" Déployé le:", new Date(addresses.deployedAt).toLocaleString());
    console.log(" Réseau:", addresses.network);
    console.log(" Chain ID:", addresses.chainId);
    console.log("=====================================");
    
    return addresses;
  } catch (error) {
    console.error(" Erreur:", error.message);
    return null;
  }
}

if (require.main === module) {
  displayContractAddresses();
}

module.exports = {
  getContractAddresses,
  displayContractAddresses
};
