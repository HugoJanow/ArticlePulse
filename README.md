# 📰 ArticlePulse

**Statut** : 🚧 En attente | ⏳ Prototype finalisé le 09/05/2025

## 📖 Description

**ArticlePulse** est une plateforme de micro-paiements décentralisée qui permet à un lecteur de payer un article à l’unité à l’aide d’un jeton ERC-20 (réseau testnet Sepolia). Une fois le paiement effectué, l'utilisateur peut immédiatement déverrouiller et lire un article protégé par chiffrement.

Ce projet illustre une chaîne complète de distribution sécurisée et décentralisée de contenu, sans abonnement ni intermédiaire.

## 🎯 Objectifs

- Démontrer un système de paiement à l’unité pour la lecture d’articles numériques.
- Déployer et interagir avec un smart contract Ethereum sur Sepolia
- Sécuriser les contenus via chiffrement AES-GCM.
- Stocker les contenus chiffrés sur IPFS ou localement.
- Réaliser un prototype **full-stack** intégrant smart contracts, backend et frontend.
- Utiliser un faucet Sepolia pour approvisionner le compte déployeur.

## 🛠️ Technologies utilisées

### Frontend
- React
- ethers.js

### Backend
- Node.js
- Express
- MongoDB

### Blockchain
- Solidity
- Hardhat
- ERC-20 sur le réseau **Sepolia**

### Sécurité & Stockage
- AES-GCM pour le chiffrement des articles
- IPFS (via Pinata ou Infura) pour le stockage distribué

## 🔗 Fonctionnalités principales

- 📄 Affichage d’un catalogue d’articles (3 articles disponibles dans le prototype).
- 🔐 Chiffrement des articles avec une clé AES-GCM unique.
- 💳 Paiement on-chain via ethers.js en jetons ERC-20.
- 🔓 Déverrouillage de la clé AES suite à la transaction.
- 📦 Stockage et récupération des contenus via IPFS.

## 🚀 Lancer le serveur backend

- ```bash
- cd server
- npm install
- npm start
- ```

## 👨‍💻 Étudiants impliqués

- **Hugo Janow** - [hugo.janow@epitech.eu](mailto:hugo.janow@epitech.eu)
- **Mathieu Simon** - [mathieu.simon@epitech.eu](mailto:mathieu.simon@epitech.eu)
