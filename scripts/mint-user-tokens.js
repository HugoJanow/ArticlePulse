const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  console.log(" Mint de tokens APT pour l'utilisateur...");
  
  const contractsConfig = require('../server/config/contracts.json');
  const tokenAddress = contractsConfig.token;
  const userAddress = "0xbDA5747bFD65F08deb54cb465eB87D40e51B197E";
  
  console.log(` Adresse du contrat Token: ${tokenAddress}`);
  
  const [deployer] = await ethers.getSigners();
  console.log(" Déployeur:", deployer.address);
  
  const token = await ethers.getContractAt("Token", tokenAddress);
  console.log(`\n Mint de tokens pour ${userAddress}...`);

  try {
    const mintAmount = ethers.parseEther("5000");
    const tx = await token.mint(userAddress, mintAmount);
    await tx.wait();
    
    console.log(` Minté ${ethers.formatEther(mintAmount)} APT pour ${userAddress}`);
    
    const balance = await token.balanceOf(userAddress);
    console.log(` Nouveau solde: ${ethers.formatEther(balance)} APT`);
    
  } catch (error) {
    console.error(" Erreur lors du mint:", error.message);
  }

  console.log("\n Mint terminé! Actualisez votre page web.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(" Erreur:", error);
    process.exit(1);
  });
