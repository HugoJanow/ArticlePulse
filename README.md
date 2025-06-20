# 📰 ArticlePulse

**Plateforme de micro-paiements décentralisée pour articles premium**

## 🚀 Vue d'ensemble

ArticlePulse est une plateforme moderne qui permet aux utilisateurs d'acheter et de lire des articles premium en utilisant des tokens ERC-20 et des smart contracts Ethereum. Les articles sont chiffrés et ne sont accessibles qu'après achat.

## ✨ Fonctionnalités

- 🔐 **Contenu chiffré** - Articles protégés par chiffrement AES-256
- 💳 **Paiements décentralisés** - Via smart contracts et tokens ERC-20
- 🔑 **Accès conditionnel** - Déchiffrement automatique après achat
- 🎨 **Interface moderne** - React avec design responsive
- 📱 **API RESTful** - Backend Node.js avec MongoDB
- ⚡ **Performances optimisées** - Architecture modulaire et scalable

## 🏗️ Architecture

```
📁 ArticlePulse/
├── 🖥️ server/                    # Backend Node.js
│   ├── app.js                   # Point d'entrée principal
│   ├── config/                  # Configuration centralisée
│   │   ├── index.js            # Variables d'environnement
│   │   └── database.js         # Configuration MongoDB
│   ├── controllers/             # Logique métier
│   │   └── articleController.js # Gestion des articles
│   ├── routes/                  # Endpoints API
│   │   ├── articles.js         # Routes articles
│   │   └── content.js          # Routes contenu
│   ├── middleware/              # Middleware personnalisés
│   │   ├── validation.js       # Validation des données
│   │   └── logger.js           # Logging des requêtes
│   ├── utils/                   # Utilitaires
│   │   └── encryptionService.js # Service de chiffrement
│   ├── models/                  # Modèles MongoDB
│   │   └── Article.js          # Modèle Article
│   └── services/                # Services externes
│       └── blockchain.js       # Intégration blockchain
├── 💻 client/                    # Frontend React
│   └── src/
│       ├── components/          # Composants React
│       │   ├── ArticleCard.js  # Carte d'article
│       │   └── ArticleViewer.js # Lecteur d'article
│       ├── services/            # Services API
│       │   └── api.js          # Client API
│       ├── hooks/               # Hooks personnalisés
│       │   └── useArticles.js  # Hook articles
│       ├── utils/               # Utilitaires frontend
│       │   └── helpers.js      # Fonctions utilitaires
│       └── contracts/           # ABIs des smart contracts
├── 📜 contracts/                 # Smart contracts Solidity
│   ├── Token.sol               # Token ERC-20
│   └── ArticlePurchase.sol     # Contrat d'achat
└── 📚 scripts/                   # Scripts utilitaires
```

## 🛠️ Technologies

### Backend
- **Node.js** - Environnement d'exécution
- **Express.js** - Framework web
- **MongoDB** - Base de données NoSQL
- **Mongoose** - ODM pour MongoDB
- **Helmet** - Sécurité HTTP
- **Express-validator** - Validation des données
- **Crypto** - Chiffrement natif Node.js

### Frontend
- **React** - Bibliothèque UI
- **Ethers.js** - Interaction blockchain
- **Axios** - Client HTTP
- **CSS3** - Styles modernes avec variables CSS

### Blockchain
- **Solidity** - Smart contracts
- **Hardhat** - Framework de développement
- **OpenZeppelin** - Bibliothèques sécurisées

## 🚀 Installation et Démarrage

### Prérequis
- Node.js 18+
- MongoDB
- MetaMask (pour le frontend)
- Git

### 1. Installation des dépendances

#### Backend
```bash
cd server
npm install
```

#### Frontend
```bash
cd client
npm install
```

### 2. Base de données
```bash
# Démarrer MongoDB (Docker)
sudo docker run -d --name mongodb -p 27017:27017 mongo:latest
```

### 3. Initialisation des données
```bash
cd server
node scripts/create-clean-db.js
```

### 4. Démarrage des services

#### Backend (Port 3001)
```bash
cd server
node app.js
```

#### Frontend (Port 3000)
```bash
cd client
npm start
```

## 📡 API Endpoints

### Articles
- `GET /api/articles` - Lister tous les articles
- `GET /api/articles/:id` - Obtenir un article spécifique
- `POST /api/articles` - Créer un article (admin)

### Contenu
- `GET /api/content/:id/:userAddress` - Accéder au contenu déchiffré

### Utilitaires
- `GET /health` - Santé de l'API
- `GET /api/contracts` - Adresses des contrats

## 🔐 Sécurité

### Chiffrement
- **Algorithme** : AES-256-CBC
- **Clés uniques** : Chaque article a sa propre clé
- **Stockage sécurisé** : Clés stockées avec les smart contracts

### Validation
- **Entrées** : Validation stricte avec express-validator
- **Adresses Ethereum** : Format et checksum validés
- **Types de données** : Vérification des types et plages

## 🧪 Tests

### Test automatique
```bash
./test-platform.sh
```

### Test manuel
1. **Backend** : `curl http://localhost:3001/health`
2. **Frontend** : Ouvrir `http://localhost:3000`
3. **Articles** : Vérifier l'affichage des articles
4. **Chiffrement** : Tester l'accès au contenu

## 🎯 Workflow Utilisateur

1. **Connexion** - Connecter MetaMask
2. **Navigation** - Parcourir les articles disponibles
3. **Achat** - Acheter un article avec des tokens APT
4. **Lecture** - Accéder au contenu déchiffré
5. **Expérience** - Interface moderne et intuitive

**🎉 ArticlePulse - L'avenir de la publication décentralisée !**
