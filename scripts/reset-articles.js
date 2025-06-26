const { ethers } = require("hardhat");
const mongoose = require('mongoose');
const Article = require('../server/models/Article');

async function main() {
    console.log(" Reset et synchronisation des articles...");
    await mongoose.connect('mongodb://localhost:27017/articlepulse');
    console.log(" Connected to MongoDB");
    
    const contractsConfig = require('../server/config/contracts.json');
    console.log(" Contract addresses:", contractsConfig);
    console.log("\n Clearing existing articles from database...");
    await Article.deleteMany({});
    console.log(" Database cleared");
    
    console.log("\n Getting current contract state...");
    const ArticlePurchase = await ethers.getContractAt("ArticlePurchase", contractsConfig.articlePurchase);
    const currentCount = await ArticlePurchase.getArticleCount();
    console.log("Articles in contract:", currentCount.toString());
    const articles = [
        {
            id: 1,
            title: "Introduction à la Blockchain",
            price: "100000000000000000",
            description: "Un guide complet pour comprendre les bases de la technologie blockchain et ses applications.",
            author: "Dr. Sarah Blockchain",
            content: "Contenu complet de l'article sur la blockchain. Ce contenu explique en détail les concepts fondamentaux de la blockchain, son fonctionnement, ses avantages et ses applications dans différents secteurs. La blockchain est une technologie révolutionnaire qui permet de créer des registres distribués et immutables..."
        },
        {
            id: 2,
            title: "Smart Contracts avec Solidity", 
            price: "150000000000000000",
            description: "Apprenez à développer des contrats intelligents robustes avec Solidity et les meilleures pratiques.",
            author: "Prof. Alex Ethereum",
            content: "Guide complet pour développer des smart contracts avec Solidity. Ce tutoriel couvre les bases du langage Solidity, les patterns de sécurité, l'optimisation du gas, et les meilleures pratiques pour créer des contrats robustes et sécurisés..."
        },
        {
            id: 3,
            title: "DeFi : L'Avenir de la Finance",
            price: "200000000000000000",
            description: "Explorez l'écosystème DeFi et découvrez comment la finance décentralisée révolutionne le secteur financier.",
            author: "Maria DeFiExpert",
            content: "Analyse approfondie de l'écosystème DeFi. Cet article explore les protocoles de finance décentralisée, les yield farming, les AMM (Automated Market Makers), les risques et opportunités de la DeFi, ainsi que son impact sur le système financier traditionnel..."
        }
    ];
    console.log("\n Adding articles to database...");
    for (const articleData of articles) {
        const article = new Article({
            id: articleData.id,
            title: articleData.title,
            description: articleData.description,
            price: articleData.price,
            author: articleData.author,
            encryptedContent: Buffer.from(articleData.content).toString('hex'), // Simple "encryption" for demo
            encryptionKey: "demo-key-" + articleData.id,
            ipfsHash: null,
            createdAt: new Date()
        });
        
        await article.save();
        console.log(` Article ${articleData.id} added to database`);
    }
    if (currentCount.toString() === "0") {
        console.log("\n Adding articles to smart contract...");
        const [owner] = await ethers.getSigners();
        
        for (const articleData of articles) {
            const tx = await ArticlePurchase.addArticle(
                articleData.title,
                articleData.price,
                articleData.content
            );
            await tx.wait();
            console.log(` Article ${articleData.id} added to contract`);
        }
    } else {
        console.log(" Articles already exist in contract");
    }
    console.log("\n Verification finale...");
    const dbArticles = await Article.find({}).sort({ id: 1 });
    const contractCount = await ArticlePurchase.getArticleCount();
    console.log(`Database articles: ${dbArticles.length}`);
    console.log(`Contract articles: ${contractCount.toString()}`);
    
    for (let i = 1; i <= contractCount; i++) {
        const contractArticle = await ArticlePurchase.getArticle(i);
        const dbArticle = dbArticles.find(a => a.id === i);
        console.log(`\nArticle ${i}:`);
        console.log(`  Contract: ${contractArticle.title}`);
        console.log(`  Database: ${dbArticle ? dbArticle.title : 'NOT FOUND'}`);
        console.log(`  IDs match: ${dbArticle && dbArticle.id === i}`);
    }
    await mongoose.disconnect();
    console.log("\n Reset and synchronization complete!");
}

main().catch((error) => {
    console.error("Error:", error);
    process.exitCode = 1;
});
