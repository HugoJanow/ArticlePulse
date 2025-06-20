const { ethers } = require("hardhat");
const { getContractAddresses } = require("./get-addresses");

async function main() {
  console.log("Adding articles to smart contract...");
  
  let purchaseAddress;
  try {
    const addresses = getContractAddresses();
    purchaseAddress = addresses.purchaseAddress;
  } catch (error) {
    process.exit(1);
  }
  
  const articles = [
    {
      id: 1,
      title: "Introduction à la Blockchain",
      price: "100000000000000000",
      content: "Contenu chiffré de l'article sur la blockchain..."
    },
    {
      id: 2,
      title: "Smart Contracts avec Solidity", 
      price: "150000000000000000",
      content: "Contenu chiffré de l'article sur Solidity..."
    },
    {
      id: 3,
      title: "DeFi : L'Avenir de la Finance",
      price: "200000000000000000",
      content: "Contenu chiffré de l'article sur DeFi..."
    }
  ];
  
  const [owner] = await ethers.getSigners();
  console.log(" Owner account:", owner.address);
  
  const ArticlePurchase = await ethers.getContractFactory("ArticlePurchase");
  const purchase = await ArticlePurchase.attach(purchaseAddress);
  
  
  try {
    for (const article of articles) {
      console.log(`\n Adding: ${article.title}`);
      
      const tx = await purchase.addArticle(
        article.title,
        article.price,
        article.content
      );
      
      await tx.wait();
      console.log(`Article ${article.id} added successfully`);
    }
    
    const articleCount = await purchase.getArticleCount();
    console.log(`\n Total articles in contract: ${articleCount}`);
    
    console.log("\n Articles in contract:");
    for (let i = 1; i <= articleCount; i++) {
      const [title, price, content, isActive] = await purchase.getArticle(i);
      console.log(`Article ${i}:`);
      console.log(`  Title: ${title}`);
      console.log(`  Price: ${ethers.formatEther(price)} ETH`);
      console.log(`  Active: ${isActive}`);
      console.log(`  Content preview: ${content.substring(0, 50)}...`);
    }
    
  } catch (error) {
    console.error(" Error adding articles:", error.message);
    
    if (error.message.includes("only owner")) {
      console.log(" Make sure you're using the account that deployed the contract");
    }
  }
}

main()
  .then(() => {
    console.log("\n Articles added successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n Script failed:", error);
    process.exit(1);
  });
