const hre = require("hardhat");

async function main() {
  const Token = await hre.ethers.getContractFactory("Token");
  const token = await Token.deploy();
  await token.waitForDeployment();
  console.log("Token deployed to:", await token.getAddress());

  const ArticlePurchase = await hre.ethers.getContractFactory("ArticlePurchase");
  const purchase = await ArticlePurchase.deploy(await token.getAddress());
  await purchase.waitForDeployment();
  console.log("ArticlePurchase deployed to:", await purchase.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
