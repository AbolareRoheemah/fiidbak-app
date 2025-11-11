import { ethers } from 'hardhat';


async function main() {
  const productNFT = await ethers.deployContract('ProductNFT');

  await productNFT.waitForDeployment();

  console.log('productNFT Contract Deployed at ' + productNFT.target);

  const badgeNFT = await ethers.deployContract('BadgeNFT');

  await badgeNFT.waitForDeployment();

  console.log('badgeNFT Contract Deployed at ' + badgeNFT.target);

  const feedbackManager = await ethers.deployContract('FeedbackManager');

  await feedbackManager.waitForDeployment();

  console.log('feedbackManager Contract Deployed at ' + feedbackManager.target);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});