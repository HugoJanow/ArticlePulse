const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log(" Déploiement des contrats...");
  
  const Token = await hre.ethers.getContractFactory("Token");
  const token = await Token.deploy();
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log(" Token deployed to:", tokenAddress);

  const ArticlePurchase = await hre.ethers.getContractFactory("ArticlePurchase");
  const purchase = await ArticlePurchase.deploy(tokenAddress);
  await purchase.waitForDeployment();
  const purchaseAddress = await purchase.getAddress();
  console.log(" ArticlePurchase deployed to:", purchaseAddress);

  const deployedContracts = {
    tokenAddress,
    purchaseAddress,
    deployedAt: new Date().toISOString(),
    network: hre.network.name,
    chainId: hre.network.config.chainId
  };

  const configDir = path.join(__dirname, "..", "config");
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  const contractsConfigPath = path.join(configDir, "contracts.json");
  fs.writeFileSync(contractsConfigPath, JSON.stringify(deployedContracts, null, 2));
  console.log(" Adresses sauvegardées dans:", contractsConfigPath);

  await updateFrontendConfig(tokenAddress, purchaseAddress);
  
  await updateBackendConfig(tokenAddress, purchaseAddress);

  console.log(" Déploiement terminé avec succès !");
}

async function updateFrontendConfig(tokenAddress, purchaseAddress) {
  try {
    const frontendConfigPath = path.join(__dirname, "..", "client", "src", "config", "index.ts");
    
    if (fs.existsSync(frontendConfigPath)) {
      let configContent = fs.readFileSync(frontendConfigPath, "utf8");
      
      configContent = configContent.replace(
        /TOKEN: '[^']*'/,
        `TOKEN: '${tokenAddress}'`
      );
      configContent = configContent.replace(
        /ARTICLE_PURCHASE: '[^']*'/,
        `ARTICLE_PURCHASE: '${purchaseAddress}'`
      );
      
      fs.writeFileSync(frontendConfigPath, configContent);
      console.log(" Configuration frontend mise à jour");
    }
  } catch (error) {
    console.warn(" Erreur lors de la mise à jour du frontend:", error.message);
  }
}

async function updateBackendConfig(tokenAddress, purchaseAddress) {
  try {
    const backendEnvPath = path.join(__dirname, "..", "server", ".env");
    
    let envContent = "";
    if (fs.existsSync(backendEnvPath)) {
      envContent = fs.readFileSync(backendEnvPath, "utf8");
    }
    
    const envVars = {
      TOKEN_CONTRACT_ADDRESS: tokenAddress,
      PURCHASE_CONTRACT_ADDRESS: purchaseAddress,
      BLOCKCHAIN_RPC_URL: "http://127.0.0.1:8545"
    };
    
    for (const [key, value] of Object.entries(envVars)) {
      const regex = new RegExp(`^${key}=.*$`, "m");
      if (regex.test(envContent)) {
        envContent = envContent.replace(regex, `${key}=${value}`);
      } else {
        envContent += `\n${key}=${value}`;
      }
    }
    
    fs.writeFileSync(backendEnvPath, envContent.trim() + "\n");
    console.log(" Configuration backend mise à jour");
  } catch (error) {
    console.warn("  Erreur lors de la mise à jour du backend:", error.message);
  }
}

main().catch((error) => {
  console.error(" Erreur de déploiement:", error);
  process.exitCode = 1;
});