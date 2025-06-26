const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
    console.log(" Reset rapide pour permettre de nouveaux achats...");
    try {
        console.log(" Déploiement de nouveaux contrats...");
        const [deployer] = await ethers.getSigners();
        console.log("Deploying contracts with account:", deployer.address);
        const Token = await ethers.getContractFactory("Token");
        const token = await Token.deploy();
        await token.waitForDeployment();
        console.log("Token deployed to:", await token.getAddress());
        const ArticlePurchase = await ethers.getContractFactory("ArticlePurchase");
        const articlePurchase = await ArticlePurchase.deploy(await token.getAddress());
        await articlePurchase.waitForDeployment();
        console.log("ArticlePurchase deployed to:", await articlePurchase.getAddress());
        const addresses = {
            token: await token.getAddress(),
            articlePurchase: await articlePurchase.getAddress()
        };
        const configPath = path.join(__dirname, '..', 'server', 'config', 'contracts.json');
        fs.writeFileSync(configPath, JSON.stringify(addresses, null, 2));
        console.log(" Nouvelles adresses sauvegardées dans", configPath);
        console.log("\n Ajout des articles au nouveau contrat...");
        const articles = [
            {
                title: "Introduction à la Blockchain",
                price: ethers.parseEther("0.1"),
                content: "Contenu chiffré de l'article sur la blockchain..."
            },
            {
                title: "Smart Contracts avec Solidity", 
                price: ethers.parseEther("0.15"),
                content: "Contenu chiffré de l'article sur Solidity..."
            },
            {
                title: "DeFi : L'Avenir de la Finance",
                price: ethers.parseEther("0.2"),
                content: "Contenu chiffré de l'article sur DeFi..."
            }
        ];
        for (const article of articles) {
            const tx = await articlePurchase.addArticle(
                article.title,
                article.price,
                article.content
            );
            await tx.wait();
            console.log(` Article ajouté: ${article.title}`);
        }
        const userAddress = "0xbDA5747bFD65F08deb54cb465eB87D40e51B197E";
        console.log(`\n Mint de tokens à ${userAddress}...`);
        const mintTx = await token.mint(userAddress, ethers.parseEther("10000"));
        await mintTx.wait();
        console.log(" 10,000 APT mintés!");
        const balance = await token.balanceOf(userAddress);
        console.log(` Nouveau solde: ${ethers.formatEther(balance)} APT`);
        console.log("\n Reset terminé avec succès!");
        console.log(" Vous pouvez maintenant:");
        console.log("1. Redémarrer le serveur backend");
        console.log("2. Rafraîchir votre frontend");
        console.log("3. Racheter tous les articles!");
        console.log("\n Nouvelles adresses:");
        console.log("Token:", await token.getAddress());
        console.log("ArticlePurchase:", await articlePurchase.getAddress());
    } catch (error) {
        console.error(" Erreur lors du reset:", error);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
