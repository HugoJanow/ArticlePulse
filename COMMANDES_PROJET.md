# ArticlePulse - Guide Complet des Commandes

## 📋 Table des Matières

1. [Configuration initiale](#1-configuration-initiale)
2. [Base de données MongoDB](#2-base-de-données-mongodb)
3. [Blockchain Hardhat](#3-blockchain-hardhat)
4. [Déploiement des contrats](#4-déploiement-des-contrats)
5. [Mint des tokens](#5-mint-des-tokens)
6. [Serveur backend](#6-serveur-backend)
7. [Frontend React](#7-frontend-react)
8. [Tests et vérifications](#8-tests-et-vérifications)
9. [Commandes de maintenance](#9-commandes-de-maintenance)
10. [Dépannage](#10-dépannage)
11. [Ordre de démarrage recommandé](#11-ordre-de-démarrage-recommandé)
12. [Variables d'environnement](#12-variables-denvironnement)
13. [Adresses de contrats](#13-adresses-de-contrats)
14. [Comptes de test Hardhat](#14-comptes-de-test-hardhat)
15. [URLs importantes](#15-urls-importantes)
16. [Scripts utiles inclus](#16-scripts-utiles-inclus)

## 1. Configuration Initiale

### Cloner ou naviguer vers le projet
```bash
cd /home/sliml/Epitech/ArticlePulse
```

### Installation des dépendances principales
```bash
npm install
```

### Installation des dépendances du client
```bash
cd client
npm install
```

### Installation des dépendances du serveur
```bash
cd ../server
npm install
cd ..
```

## 2. Base de Données MongoDB

### Démarrer MongoDB avec Docker
```bash
docker start mongodb
# OU si le conteneur n'existe pas encore:
docker run -d --name mongodb -p 27017:27017 -v mongodb_data:/data/db mongo:latest
```

### Vérifier que MongoDB fonctionne
```bash
docker ps | grep mongodb
```

### Créer la base de données et ajouter des articles
```bash
cd server
node scripts/add-sample-articles.js
```

### Ajouter du contenu chiffré aux articles
```bash
node scripts/add-content-to-articles.js
```

### Reset et maintenance
```bash
# Reset tous les achats (supprimer les enregistrements d'achats)
node scripts/reset-purchases.js

# Arrêter MongoDB
docker stop mongodb
```

## 6. Serveur Backend

### Démarrer le serveur backend (dans un terminal dédié)
```bash
cd /home/sliml/Epitech/ArticlePulse/server
node index.js
```

**Le serveur démarre sur :**
- 🌐 Server listening on port 3001
- 📱 API available at http://localhost:3001
- 📦 Connected to MongoDB

### Tester l'API
```bash
curl http://localhost:3001/api/articles
```

## 7. Frontend React

### Démarrer le frontend React (dans un terminal dédié)
```bash
cd /home/sliml/Epitech/ArticlePulse/client
npm start
```

**Le frontend démarre sur :**
- Local: http://localhost:3000
- On Your Network: http://172.18.85.157:3000

> **Note :** Si le port 3000 est occupé, il proposera automatiquement le port 3001, 3002, etc.

### Build de production
```bash
npm run build
```

## 8. Tests et Vérifications

### Tester les contrats Hardhat
```bash
npx hardhat test
```

### Vérifier la compilation des contrats
```bash
npx hardhat compile
```

### Tester l'API backend
```bash
curl http://localhost:3001/api/articles
curl http://localhost:3001/api/articles/1

# Tester avec un article spécifique (ID MongoDB)
curl http://localhost:3001/api/articles/68504af03aa2cde1dd60d197

# Tester le contenu d'un article
curl -X POST http://localhost:3001/api/articles/68504af03aa2cde1dd60d197/content \
  -H "Content-Type: application/json" \
  -d '{"userAddress":"0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"}'
```

## 9. Commandes de Maintenance

### Nettoyer les artéfacts Hardhat
```bash
npx hardhat clean
```

### Redémarrer tous les services

#### 1. Arrêter tous les processus
```bash
pkill -f "hardhat node"
pkill -f "node index.js" 
pkill -f "react-scripts"
docker stop mongodb
```

#### 2. Redémarrer dans l'ordre
```bash
docker start mongodb
npx hardhat node &
cd server && node index.js &
cd client && npm start
```

### Vérifier les processus en cours
```bash
ps aux | grep node
docker ps
```

### Nettoyer le cache npm
```bash
cd client && npm run build
cd ../server && npm cache clean --force
```

## 10. Dépannage

### Problème : "Port already in use"
```bash
# Solution : Trouver et tuer le processus
lsof -i :3000  # ou :3001, :8545
kill -9 PID
```

### Problème : MongoDB ne démarre pas
```bash
# Solution : Vérifier Docker
docker ps -a
docker logs mongodb
docker restart mongodb
```

### Problème : Contrats non déployés
```bash
# Solution : Redéployer
npx hardhat clean
npx hardhat compile
npx hardhat run scripts/deploy.js --network localhost
```

### Problème : Frontend ne compile pas
```bash
# Solution : Nettoyer et réinstaller
cd client
rm -rf node_modules package-lock.json
npm install
npm start
```

### Problème : Erreurs TypeScript
```bash
# Solution : Vérifier les types
cd client
npx tsc --noEmit
```

### Problème : MetaMask ne se connecte pas
**Solution : Configurer le réseau Hardhat**
- Network Name: Hardhat Local
- RPC URL: http://127.0.0.1:8545
- Chain ID: 31337
- Currency Symbol: ETH

## 11. Ordre de Démarrage Recommandé

### Terminal 1 - MongoDB
```bash
sudo docker start mongodb
```

### Terminal 2 - Blockchain
```bash
cd /home/sliml/Epitech/ArticlePulse
npx hardhat node
```

### Terminal 3 - Déploiement (une seule fois)
```bash
npx hardhat run scripts/deploy.js --network localhost
```

### Terminal 4 - Backend
```bash
cd /home/sliml/Epitech/ArticlePulse/server
node index.js
```

### Terminal 5 - Frontend
```bash
cd /home/sliml/Epitech/ArticlePulse/client
npm start
```

## 12. Variables d'Environnement

### server/.env
```env
MONGODB_URI=mongodb://localhost:27017/articlepulse
PORT=3001
```

### client/.env
```env
REACT_APP_API_BASE_URL=http://localhost:3001/api
REACT_APP_HARDHAT_NETWORK_URL=http://127.0.0.1:8545
REACT_APP_CHAIN_ID=31337
```

## 13. Adresses de Contrats

> **⚠️ À mettre à jour après déploiement**  
> Ces adresses changent à chaque redéploiement sur Hardhat  
> Mettre à jour dans `client/src/config/index.ts`

- **Token Contract:** `0x5FbDB2315678afecb367f032d93F642f64180aa3`
- **ArticlePurchase Contract:** `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512`

## 14. Comptes de Test Hardhat - Utilisation Détaillée

> **ℹ️ Info :** Quand vous démarrez "npx hardhat node", vous obtenez 20 comptes avec 10000 ETH chacun

### Comptes principaux

| Compte | Adresse | Clé privée |
|--------|---------|------------|
| #0 | `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` | `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80` |
| #1 | `0x70997970C51812dc3A010C7d01b50e0d17dc79C8` | `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d` |
| #2 | `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC` | `0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a` |
| #3 | `0x90F79bf6EB2c4f870365E785982E1f101E93b906` | `0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6` |
| #4 | `0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65` | `0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a` |

> **⚠️ ATTENTION :** Ne JAMAIS utiliser ces clés privées sur un réseau principal (mainnet) !

### A. Importer les comptes dans MetaMask

1. Ouvrir MetaMask
2. Cliquer sur l'icône du compte (rond coloré en haut à droite)
3. Sélectionner "Import Account"
4. Coller une des clés privées ci-dessus
5. Cliquer "Import"

### B. Configurer le réseau Hardhat dans MetaMask

1. Ouvrir MetaMask
2. Cliquer sur le réseau en haut (Ethereum Mainnet)
3. Cliquer "Add network" → "Add a network manually"
4. Remplir les champs :
   - **Network Name:** Hardhat Local
   - **New RPC URL:** http://127.0.0.1:8545
   - **Chain ID:** 31337
   - **Currency Symbol:** ETH
   - **Block Explorer URL:** (laisser vide)
5. Cliquer "Save"

### E. Script automatique pour mint des tokens

```bash
# Créer un fichier scripts/mint-tokens.js
cat > scripts/mint-tokens.js << 'EOF'
const { ethers } = require("hardhat");

async function main() {
  // Remplacer par l'adresse de votre contrat Token
  const TOKEN_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  
  const [owner, addr1, addr2, addr3] = await ethers.getSigners();
  
  const Token = await ethers.getContractFactory("Token");
  const token = await Token.attach(TOKEN_ADDRESS);
  
  console.log("Minting tokens...");
  
  // Mint pour différents comptes
  await token.mint(owner.address, ethers.parseEther("1000"));
  await token.mint(addr1.address, ethers.parseEther("500"));
  await token.mint(addr2.address, ethers.parseEther("250"));
  await token.mint(addr3.address, ethers.parseEther("100"));
  
  console.log("Tokens minted successfully!");
  
  // Afficher les balances
  const accounts = [owner, addr1, addr2, addr3];
  for (let i = 0; i < accounts.length; i++) {
    const balance = await token.balanceOf(accounts[i].address);
    console.log(`${accounts[i].address}: ${ethers.formatEther(balance)} APT`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
EOF

# Exécuter le script
npx hardhat run scripts/mint-tokens.js --network localhost
```

### F. Utiliser les comptes dans le frontend

1. Ouvrir le frontend: http://localhost:3000
2. Cliquer sur "Connect Wallet" en haut à droite
3. MetaMask s'ouvre et demande la connexion
4. Sélectionner le compte importé
5. Approuver la connexion
6. Le wallet est maintenant connecté et affiche le balance APT

**Changer de compte dans MetaMask :**
1. Cliquer sur l'icône du compte
2. Sélectionner un autre compte importé
3. Le frontend se met à jour automatiquement

### G. Tester l'achat d'articles

1. S'assurer que le compte a des tokens APT (voir section D ou E)
2. Naviguer vers un article sur le frontend
3. Cliquer "Purchase Article"
4. MetaMask demande d'approuver la transaction
5. Confirmer la transaction
6. L'article devient accessible après confirmation

### H. Commandes utiles pour déboguer

```javascript
// Voir tous les comptes et leurs balances ETH
npx hardhat console --network localhost
const accounts = await ethers.getSigners();
for (let i = 0; i < accounts.length; i++) {
  const balance = await ethers.provider.getBalance(accounts[i].address);
  console.log(`Account ${i}: ${accounts[i].address} - ${ethers.formatEther(balance)} ETH`);
}

// Reset de Hardhat (efface toutes les transactions)
// Redémarrer simplement "npx hardhat node"

// Vérifier qu'un compte peut interagir avec les contrats
const token = await ethers.getContractAt("Token", "ADRESSE_DU_TOKEN");
const balance = await token.balanceOf("ADRESSE_DU_COMPTE");
console.log("APT Balance:", ethers.formatEther(balance));
```

## 15. URLs Importantes

| Service | URL |
|---------|-----|
| **Frontend** | http://localhost:3000 |
| **Backend API** | http://localhost:3001 |
| **MongoDB** | mongodb://localhost:27017 |
| **Hardhat Network** | http://127.0.0.1:8545 |

### API Endpoints
- `GET /api/articles`
- `GET /api/articles/:id`
- `POST /api/articles/:id/content`
- `POST /api/purchases`

## 16. Scripts Utiles Inclus

Le projet inclut des scripts pratiques pour gérer les tokens et comptes :

### A. Script de mint automatique

Le fichier `scripts/mint-tokens.js` mint automatiquement des tokens APT :

```bash
# Modifier l'adresse du contrat dans le script, puis:
npx hardhat run scripts/mint-tokens.js --network localhost
```

**Ce script :**
- Mint 1000 APT pour le propriétaire (account 0)
- Mint 500 APT pour l'utilisateur 1 (account 1)  
- Mint 250 APT pour l'utilisateur 2 (account 2)
- Mint 100 APT pour l'utilisateur 3 (account 3)
- Mint 50 APT pour l'utilisateur 4 (account 4)
- Affiche tous les balances

### B. Script de vérification des balances

Le fichier `scripts/check-balances.js` affiche tous les balances :

```bash
# Modifier l'adresse du contrat dans le script, puis:
npx hardhat run scripts/check-balances.js --network localhost
```

**Ce script affiche :**
- Balances ETH de tous les comptes
- Balances APT de tous les comptes  
- Informations sur le token (nom, symbole, supply totale)

### C. Exemple d'utilisation complète

```bash
# 1. Démarrer Hardhat
npx hardhat node

# 2. Déployer les contrats (dans un autre terminal)
npx hardhat run scripts/deploy.js --network localhost

# 3. Copier les adresses des contrats affichées dans client/src/config/index.ts

# 4. Modifier TOKEN_ADDRESS dans scripts/mint-tokens.js

# 5. Mint des tokens pour tous les comptes
npx hardhat run scripts/mint-tokens.js --network localhost

# 6. Vérifier que tout fonctionne
npx hardhat run scripts/check-balances.js --network localhost

# 7. Importer les comptes dans MetaMask (voir section 14)

# 8. Démarrer backend et frontend
cd server && node index.js &
cd client && npm start

# 9. Tester l'achat d'articles avec différents comptes
```

---

## 🎉 Votre Environnement ArticlePulse est Prêt !

### Pour démarrer rapidement :

1. `docker start mongodb`
2. `npx hardhat node` (dans un terminal)
3. `npx hardhat run scripts/deploy.js --network localhost`
4. `cd server && node index.js` (dans un terminal)
5. `cd client && npm start` (dans un terminal)

---

> **💡 Conseil :** Gardez ce guide ouvert pendant le développement pour référence rapide !