const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
    try {
        const configPath = path.join(__dirname, '..', 'server', 'config', 'contracts.json');
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        console.log(" Contract Addresses:");
        console.log("Token:", config.token);
        console.log("ArticlePurchase:", config.articlePurchase);
        const ArticlePurchase = await ethers.getContractAt("ArticlePurchase", config.articlePurchase);
        const articleCount = await ArticlePurchase.getArticleCount();
        console.log(`\n📰 Articles in contract: ${articleCount.toString()}`);
        for (let i = 1; i <= articleCount; i++) {
            try {
                const article = await ArticlePurchase.getArticle(i);
                console.log(`\nArticle ${i}:`);
                console.log(`  Title: ${article.title}`);
                console.log(`  Price: ${ethers.formatEther(article.price)} AZPT`);
                console.log(`  Content: ${article.content.substring(0, 50)}...`);
                console.log(`  Active: ${article.isActive}`);
            } catch (error) {
                console.log(`Article ${i}: ERROR - ${error.message}`);
            }
        }
        
        if (articleCount.toString() === "0") {
            console.log("\n  No articles found in contract!");
            console.log("The backend has articles in the database, but they haven't been added to the smart contract.");
            console.log("This is why you're getting 'article not active' error.");
        }
        
    } catch (error) {
        console.error("Error:", error.message);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
