const mongoose = require('mongoose');
const crypto = require('crypto');
const Article = require('../models/Article');

// Function to encrypt content (matching the decrypt function)
function encryptContent(content, encryptionKey) {
    try {
        const cipher = crypto.createCipher('aes-256-cbc', encryptionKey);
        let encrypted = cipher.update(content, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return encrypted;
    } catch (error) {
        console.error('Error encrypting content:', error);
        return null;
    }
}

async function main() {
    try {
        await mongoose.connect('mongodb://localhost:27017/articlepulse');
        console.log("📦 Connected to MongoDB");
        
        const articles = await Article.find({});
        console.log(`Found ${articles.length} articles`);
        
        const contentMap = {
            1: "Contenu complet de l'article sur la blockchain. Ce contenu explique en détail les concepts fondamentaux de la blockchain, son fonctionnement, ses avantages et ses applications dans différents secteurs. La blockchain est une technologie révolutionnaire qui permet de créer des registres distribués et immutables. Elle utilise la cryptographie pour sécuriser les transactions et garantir l'intégrité des données. Les avantages incluent la décentralisation, la transparence, l'immutabilité et la réduction des intermédiaires.",
            2: "Guide complet pour développer des smart contracts avec Solidity. Ce tutoriel couvre les bases du langage Solidity, les patterns de sécurité, l'optimisation du gas, et les meilleures pratiques pour créer des contrats robustes et sécurisés. Solidity est un langage de programmation orienté contrat pour écrire des smart contracts sur Ethereum. Il est statiquement typé et supporte l'héritage, les bibliothèques et les types définis par l'utilisateur.",
            3: "Analyse approfondie de l'écosystème DeFi. Cet article explore les protocoles de finance décentralisée, les yield farming, les AMM (Automated Market Makers), les risques et opportunités de la DeFi, ainsi que son impact sur le système financier traditionnel. La DeFi révolutionne la finance en supprimant les intermédiaires traditionnels et en permettant des services financiers programmables et transparents."
        };
        
        for (const article of articles) {
            const content = contentMap[article.id];
            if (content) {
                // Proper encryption using the same method as decrypt
                const encryptionKey = `demo-key-${article.id}`;
                article.encryptedContent = encryptContent(content, encryptionKey);
                article.encryptionKey = encryptionKey;
                await article.save();
                console.log(`✅ Updated article ${article.id} with encrypted content`);
            }
        }
        
        console.log("✅ All articles updated");
        await mongoose.disconnect();
        
    } catch (error) {
        console.error("Error:", error);
    }
}

main();
