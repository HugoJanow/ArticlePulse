const hre = require("hardhat");

async function main() {
  const Token = await hre.ethers.getContractFactory("Token");
  const token = await Token.deploy();
  await token.deployed();
  console.log("Token deployed to:", token.address);

  const ArticlePurchase = await hre.ethers.getContractFactory("ArticlePurchase");
  const purchase = await ArticlePurchase.deploy(token.address);
  await purchase.deployed();
  console.log("ArticlePurchase deployed to:", purchase.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
