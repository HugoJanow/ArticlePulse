const { ethers } = require("hardhat");

async function main() {
  console.log(" Mint de tokens APT pour l'utilisateur...");

  const tokenAddress = "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853";
  const userAddress = "0xc097c9e5e1cc4f0d1b06fe4c21e4ec8fcce968be"; // Adresse en lowercase

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
